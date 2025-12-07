"""
Book content embedding pipeline.
Parses Docusaurus MDX/MD files, chunks into passages, generates embeddings, uploads to Qdrant.
"""
import os
import sys
import asyncio
import re
from pathlib import Path
from typing import List, Dict, Tuple
from uuid import uuid4

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
import tiktoken

# Load environment variables
load_dotenv()

# Import our Gemini-based embedding service
from src.services.embedding import EmbeddingService


class BookEmbeddingPipeline:
    """Pipeline to embed Docusaurus book content into Qdrant"""

    def __init__(
        self,
        docs_path: str = "../../../docs",
        collection_name: str = "book_passages",
        chunk_size: int = 600,  # tokens
        chunk_overlap: int = 100  # tokens
    ):
        """
        Initialize embedding pipeline.

        Args:
            docs_path: Path to Docusaurus docs folder
            collection_name: Qdrant collection name
            chunk_size: Target chunk size in tokens
            chunk_overlap: Overlap between chunks in tokens
        """
        # Debug path resolution
        script_file = Path(__file__)
        script_parent = script_file.parent
        docs_path_relative = script_parent / docs_path
        docs_path_absolute = docs_path_relative.resolve()

        print(f"DEBUG: __file__ = {script_file}")
        print(f"DEBUG: parent = {script_parent}")
        print(f"DEBUG: docs_path param = {docs_path}")
        print(f"DEBUG: combined = {docs_path_relative}")
        print(f"DEBUG: resolved = {docs_path_absolute}")
        print(f"DEBUG: exists = {docs_path_absolute.exists()}")
        print(f"DEBUG: is_dir = {docs_path_absolute.is_dir()}")

        self.docs_path = docs_path_absolute
        self.collection_name = collection_name
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        # Initialize clients
        self.embedding_service = EmbeddingService()  # Uses Gemini
        self.qdrant_client = QdrantClient(
            url=os.getenv("QDRANT_URL"),
            api_key=os.getenv("QDRANT_API_KEY")
        )

        # Initialize tokenizer for accurate token counting
        # Use cl100k_base encoding (same as GPT-4, GPT-3.5-turbo, text-embedding-3-small)
        self.tokenizer = tiktoken.get_encoding("cl100k_base")

        print(f"\nInitialized pipeline:")
        print(f"  - Docs path: {self.docs_path}")
        print(f"  - Collection: {collection_name}")
        print(f"  - Chunk size: {chunk_size} tokens")
        print(f"  - Chunk overlap: {chunk_overlap} tokens")

    def parse_mdx_file(self, file_path: Path) -> Dict[str, str]:
        """
        Parse MDX/MD file and extract metadata + content.

        Args:
            file_path: Path to MDX/MD file

        Returns:
            Dict with title, content, and metadata
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract frontmatter
        frontmatter_match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
        if frontmatter_match:
            frontmatter = frontmatter_match.group(1)
            content = content[frontmatter_match.end():]
        else:
            frontmatter = ""

        # Extract title from frontmatter or first heading
        title_match = re.search(r'^title:\s*(.+)$', frontmatter, re.MULTILINE)
        if title_match:
            title = title_match.group(1).strip().strip('"\'')
        else:
            # Try to get first # heading
            heading_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
            title = heading_match.group(1) if heading_match else file_path.stem

        # Remove MDX imports and exports
        content = re.sub(r'^import\s+.*$', '', content, flags=re.MULTILINE)
        content = re.sub(r'^export\s+.*$', '', content, flags=re.MULTILINE)

        # Remove JSX components (simplified - keeps content inside)
        content = re.sub(r'<[A-Z][^>]*>', '', content)
        content = re.sub(r'</[A-Z][^>]*>', '', content)

        # Clean up excessive newlines
        content = re.sub(r'\n{3,}', '\n\n', content)

        return {
            "title": title,
            "content": content.strip(),
            "file_path": str(file_path),
            "relative_path": str(file_path.relative_to(self.docs_path.parent))
        }

    def chunk_text(self, text: str, metadata: Dict) -> List[Dict]:
        """
        Chunk text into passages of ~chunk_size tokens with overlap.

        Args:
            text: Text to chunk
            metadata: File metadata (title, path, etc.)

        Returns:
            List of chunk dicts
        """
        # Tokenize
        tokens = self.tokenizer.encode(text)
        total_tokens = len(tokens)

        if total_tokens == 0:
            return []

        chunks = []
        start = 0

        while start < total_tokens:
            # Get chunk
            end = min(start + self.chunk_size, total_tokens)
            chunk_tokens = tokens[start:end]

            # Decode back to text
            chunk_text = self.tokenizer.decode(chunk_tokens)

            # Create chunk metadata
            chunk = {
                "text": chunk_text,
                "title": metadata["title"],
                "file_path": metadata["file_path"],
                "relative_path": metadata["relative_path"],
                "chunk_index": len(chunks),
                "total_chunks": -1,  # Will update after loop
                "token_count": len(chunk_tokens)
            }

            chunks.append(chunk)

            # Move to next chunk with overlap
            start += self.chunk_size - self.chunk_overlap

            # Prevent infinite loop
            if start >= total_tokens:
                break

        # Update total_chunks
        for chunk in chunks:
            chunk["total_chunks"] = len(chunks)

        return chunks

    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for texts using Gemini (768 dimensions).

        Args:
            texts: List of texts to embed

        Returns:
            List of embedding vectors (768-dimensional)
        """
        return await self.embedding_service.embed_batch(texts)

    def infer_chapter_section(self, file_path: Path) -> Tuple[str, str]:
        """
        Infer chapter and section from file path.

        Args:
            file_path: Path to file

        Returns:
            Tuple of (chapter_title, section_title)
        """
        parts = file_path.parts

        # Try to find module/chapter structure
        chapter = "General"
        section = file_path.stem

        for i, part in enumerate(parts):
            if part.startswith("module"):
                chapter = part.replace("-", " ").title()
                if i + 1 < len(parts) and parts[i + 1].startswith("chapter"):
                    chapter = f"{chapter} - {parts[i + 1].replace('-', ' ').title()}"
                break

        return chapter, section

    def generate_source_url(self, relative_path: str) -> str:
        """
        Generate source URL for passage.

        Args:
            relative_path: Relative path from docs root

        Returns:
            URL to book section
        """
        # Convert file path to URL path
        # Example: docs/module1-ros2/chapter1-core-concepts/1.1-nodes.mdx
        # -> /docs/module1-ros2/chapter1-core-concepts/1.1-nodes

        url_path = relative_path.replace("docs/", "/docs/")
        url_path = re.sub(r'\.(mdx?|md)$', '', url_path)

        # Assuming deployed at root (adjust for your deployment)
        base_url = os.getenv("BOOK_BASE_URL", "https://your-book-url.com")
        return f"{base_url}{url_path}"

    async def process_file(self, file_path: Path) -> List[Dict]:
        """
        Process single file: parse, chunk, prepare for embedding.

        Args:
            file_path: Path to MDX/MD file

        Returns:
            List of passage dicts ready for embedding
        """
        print(f"Processing: {file_path.relative_to(self.docs_path.parent)}")

        # Parse file
        parsed = self.parse_mdx_file(file_path)

        if not parsed["content"]:
            print(f"  [WARNING] Skipping (no content)")
            return []

        # Chunk content
        chunks = self.chunk_text(parsed["content"], parsed)

        if not chunks:
            print(f"  [WARNING] Skipping (no chunks generated)")
            return []

        # Prepare passages
        passages = []
        for chunk in chunks:
            chapter, section = self.infer_chapter_section(file_path)

            passage = {
                "text": chunk["text"],
                "chapter_title": chapter,
                "section_title": f"{section} (Part {chunk['chunk_index'] + 1}/{chunk['total_chunks']})" if chunk['total_chunks'] > 1 else section,
                "source_url": self.generate_source_url(parsed["relative_path"]),
                "paragraph_id": f"chunk-{chunk['chunk_index']}",
                "token_count": chunk["token_count"]
            }

            passages.append(passage)

        print(f"  [OK] Generated {len(passages)} passages ({sum(p['token_count'] for p in passages)} tokens)")

        return passages

    async def embed_and_upload(self, passages: List[Dict]):
        """
        Generate embeddings and upload to Qdrant.

        Args:
            passages: List of passage dicts
        """
        if not passages:
            print("No passages to embed")
            return

        print(f"\nGenerating embeddings for {len(passages)} passages...")

        # Extract texts
        texts = [p["text"] for p in passages]

        # Generate embeddings in batches
        batch_size = 100
        all_embeddings = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            print(f"  Embedding batch {i // batch_size + 1}/{(len(texts) - 1) // batch_size + 1}...")
            embeddings = await self.generate_embeddings(batch)
            all_embeddings.extend(embeddings)

        print(f"[OK] Generated {len(all_embeddings)} embeddings")

        # Prepare Qdrant points
        print("\nUploading to Qdrant...")
        points = []

        for passage, embedding in zip(passages, all_embeddings):
            point = PointStruct(
                id=str(uuid4()),
                vector=embedding,
                payload={
                    "passage_text": passage["text"],
                    "chapter_title": passage["chapter_title"],
                    "section_title": passage["section_title"],
                    "source_url": passage["source_url"],
                    "paragraph_id": passage["paragraph_id"]
                }
            )
            points.append(point)

        # Upload in batches
        batch_size = 100
        for i in range(0, len(points), batch_size):
            batch = points[i:i + batch_size]
            self.qdrant_client.upsert(
                collection_name=self.collection_name,
                points=batch
            )
            print(f"  Uploaded batch {i // batch_size + 1}/{(len(points) - 1) // batch_size + 1}")

        print(f"[OK] Uploaded {len(points)} passages to Qdrant")

    async def run(self):
        """Run the complete embedding pipeline"""
        print("="*60)
        print("BOOK CONTENT EMBEDDING PIPELINE")
        print("="*60)

        # Find all MDX/MD files
        md_files = list(self.docs_path.rglob("*.md")) + list(self.docs_path.rglob("*.mdx"))
        print(f"\nFound {len(md_files)} Markdown files\n")

        # Process all files
        all_passages = []
        for file_path in md_files:
            passages = await self.process_file(file_path)
            all_passages.extend(passages)

        print(f"\n{'='*60}")
        print(f"Total passages generated: {len(all_passages)}")
        print(f"Total tokens: {sum(p['token_count'] for p in all_passages)}")
        print(f"{'='*60}\n")

        # Embed and upload
        await self.embed_and_upload(all_passages)

        print("\n" + "="*60)
        print("EMBEDDING PIPELINE COMPLETE!")
        print("="*60)
        print(f"\nYour Qdrant collection now has {len(all_passages)} searchable passages.")
        print("You can now test queries against your book content!")


async def main():
    """Main entry point"""
    pipeline = BookEmbeddingPipeline()
    await pipeline.run()


if __name__ == "__main__":
    asyncio.run(main())
