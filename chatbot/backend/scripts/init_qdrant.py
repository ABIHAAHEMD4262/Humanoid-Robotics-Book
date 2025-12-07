"""
Initialize Qdrant collection for book passage embeddings.
Creates collection with 1536-dimensional vectors (OpenAI text-embedding-3-small).
"""
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def init_qdrant_collection():
    """Initialize Qdrant collection for book passages"""

    # Get Qdrant connection details from environment
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")

    if not qdrant_url or not qdrant_api_key:
        print("ERROR: QDRANT_URL and QDRANT_API_KEY must be set in .env file")
        sys.exit(1)

    # Initialize Qdrant client
    print(f"Connecting to Qdrant at {qdrant_url}...")
    client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)

    collection_name = "book_passages"

    # Check if collection already exists
    try:
        collections = client.get_collections().collections
        existing = any(c.name == collection_name for c in collections)

        if existing:
            print(f"Collection '{collection_name}' already exists.")
            response = input("Do you want to delete and recreate it? (yes/no): ")
            if response.lower() == "yes":
                print(f"Deleting existing collection '{collection_name}'...")
                client.delete_collection(collection_name=collection_name)
            else:
                print("Keeping existing collection. Exiting.")
                return
    except Exception as e:
        print(f"Note: {e}")

    # Create collection with vector configuration
    print(f"Creating collection '{collection_name}'...")
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=1536,  # OpenAI text-embedding-3-small dimension
            distance=Distance.COSINE,  # For similarity threshold ≥0.7
        )
    )

    print(f"[OK] Collection '{collection_name}' created successfully!")
    print(f"  - Vector size: 1536 dimensions")
    print(f"  - Distance metric: Cosine similarity")
    print(f"  - Ready for embeddings with threshold >=0.7")

    # Print collection info
    info = client.get_collection(collection_name=collection_name)
    print(f"\nCollection details:")
    print(f"  - Vectors count: {info.vectors_count}")
    print(f"  - Points count: {info.points_count}")

if __name__ == "__main__":
    init_qdrant_collection()
