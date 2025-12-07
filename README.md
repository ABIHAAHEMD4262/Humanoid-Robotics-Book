# Physical AI & Humanoid Robotics Book 🤖

A comprehensive, hands-on guide to building intelligent robots that interact with the physical world. Learn ROS 2, digital twin simulation, and vision-language-action models through practical projects - **now with an AI-powered RAG chatbot assistant!**

**Live Site**: [https://ABIHAAHEMD4262.github.io/Humanoid-Robotics-Book/](https://ABIHAAHEMD4262.github.io/Humanoid-Robotics-Book/)

**Chatbot Backend**: [https://abihacodes-rag-chatbot-backend.hf.space](https://abihacodes-rag-chatbot-backend.hf.space)

## Features

### Interactive AI Chatbot Assistant

This book includes an intelligent RAG (Retrieval-Augmented Generation) chatbot that helps you learn more effectively:

- **Ask Questions**: Get accurate answers grounded in the book content with citations
- **Text Selection**: Highlight any text from the book and ask contextual questions
- **Smart Retrieval**: Powered by Qdrant vector database with semantic search
- **Source Citations**: Every answer includes clickable citations to the relevant book sections
- **FAQ Shortcuts**: Quick access to common questions about ROS 2, URDF, Gazebo, and VLA models

**Technologies**:
- **Backend**: FastAPI + Python 3.12, hosted on HuggingFace Spaces
- **Vector DB**: Qdrant Cloud for semantic search
- **Embeddings**: Google Gemini text-embedding-004 (768-dimensional)
- **LLM**: OpenAI GPT-4o-mini for answer generation
- **Frontend**: React component integrated into Docusaurus

### Book Content

This website is built using [Docusaurus 3](https://docusaurus.io/), a modern static website generator.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Local Development

```bash
npm start
```

This command starts a local development server and opens http://localhost:3000/Humanoid-Robotics-Book/ in your browser. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Serve Locally

```bash
npm run serve
```

Serves the built website locally to test the production build.

## 📚 Book Structure

### Module 1: The Robotic Nervous System (ROS 2)
- **Chapter 1**: Core Communication Patterns (nodes, topics, services, actions)
- **Chapter 2**: Python Development with rclpy
- **Chapter 3**: Robot Description with URDF & Xacro
- **Chapter 4**: ROS 2 Packages & Build Systems
- **Chapter 5**: Mini-Project - Walking Gait Publisher

### Module 2: Digital Twin & Simulation
- Gazebo and Unity integration
- Isaac Sim workflows
- Physics simulation

### Module 3: AI-Robot Brain (NVIDIA Isaac Platform)
- Domain randomization
- Sim2Real transfer
- Navigation systems

### Module 4: Vision-Language-Action Models
- VLA pipeline integration
- LLM task planning
- Conversational humanoids

## 🤖 RAG Chatbot Architecture

### Backend Infrastructure

```
chatbot/
├── backend/                # Local development backend
│   ├── src/
│   │   ├── api/           # FastAPI routes and middleware
│   │   ├── models/        # Pydantic data models
│   │   ├── services/      # Business logic (retrieval, LLM, embeddings)
│   │   └── utils/         # Configuration and validators
│   ├── scripts/
│   │   └── embed_book_content.py  # Vector database population
│   └── pyproject.toml     # Python dependencies (Poetry)
│
└── hf-space/              # HuggingFace Space deployment
    ├── Dockerfile         # Container configuration
    ├── app.py            # Entry point
    └── src/              # Same structure as backend/
```

### Frontend Integration

```
src/
├── components/
│   └── ChatbotWidget.js   # React chatbot component
└── theme/
    └── Root.js           # Docusaurus theme wrapper
```

### Data Flow

1. **User Query** → Frontend ChatbotWidget
2. **Embedding Generation** → Google Gemini API (768-dim vector)
3. **Semantic Search** → Qdrant Cloud (retrieve top 3-5 passages, similarity ≥ 0.5)
4. **Answer Generation** → OpenAI GPT-4o-mini (grounded in retrieved passages)
5. **Citation Extraction** → Parse chapter/section references
6. **Response Display** → Frontend with clickable citations

### Environment Variables

The chatbot backend requires these environment variables (see `chatbot/backend/.env.example`):

```bash
QDRANT_URL=https://your-cluster.region.gcp.cloud.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key
GOOGLE_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

## 🌐 Deployment

### Automatic GitHub Pages Deployment

This site automatically deploys to GitHub Pages when you push to the `main` branch.

**Deployment Process**:
1. Push changes to `main` branch
2. GitHub Actions automatically builds and deploys
3. Site is live at [https://ABIHAAHEMD4262.github.io/Humanoid-Robotics-Book/](https://ABIHAAHEMD4262.github.io/Humanoid-Robotics-Book/)

### Manual Deployment

```bash
GIT_USER=ABIHAAHEMD4262 npm run deploy
```

This command builds the website and pushes to the `gh-pages` branch.

### Backend Deployment (HuggingFace Spaces)

The chatbot backend is deployed on HuggingFace Spaces using Docker:

1. Navigate to [HuggingFace Spaces](https://huggingface.co/spaces)
2. Create new Space with Docker runtime
3. Upload files from `chatbot/hf-space/`
4. Configure secrets in Space settings
5. Space automatically builds and deploys

**Live Backend**: [https://abihacodes-rag-chatbot-backend.hf.space](https://abihacodes-rag-chatbot-backend.hf.space)

## 🛠️ Development

### Project Structure

```
Humanoid-Robotics-Book/
├── docs/                  # Documentation pages
│   ├── intro.md
│   ├── module1-ros2/      # Module 1 chapters
│   ├── module2-digital-twin/
│   ├── module3-isaac-platform/
│   ├── module4-vla/
│   └── appendices/
├── src/
│   ├── components/        # React components (including ChatbotWidget)
│   ├── css/              # Custom styles
│   ├── pages/            # Custom pages
│   └── theme/            # Docusaurus theme customizations
├── static/               # Static assets
├── chatbot/              # RAG chatbot implementation
│   ├── backend/          # FastAPI backend (local dev)
│   └── hf-space/         # HuggingFace Space deployment
├── specs/                # Feature specifications
│   └── 001-rag-chatbot-backend/
│       ├── spec.md       # Requirements
│       ├── plan.md       # Architecture
│       └── tasks.md      # Implementation tasks
├── docusaurus.config.ts  # Docusaurus configuration
└── sidebars.ts          # Sidebar configuration
```

### Technologies Used

**Frontend**:
- Docusaurus 3.9.2 (Static site generator)
- React 18 (UI framework)
- TypeScript (Type-safe development)
- MDX (Markdown with JSX)

**Backend**:
- FastAPI (Python web framework)
- Pydantic (Data validation)
- Qdrant Python Client (Vector database)
- Google Generative AI (Embeddings)
- OpenAI API (LLM)

**Infrastructure**:
- GitHub Pages (Frontend hosting)
- HuggingFace Spaces (Backend hosting)
- Qdrant Cloud (Vector database)
- GitHub Actions (CI/CD)

## 📊 Project Metrics

**Total Lines of Code**: ~15,000+
- Frontend: ~500 (ChatbotWidget.js)
- Backend: ~2,500 (Python services, models, API routes)
- Book Content: ~12,000 (MDX documentation)

**Chatbot Features**:
- 3 FAQ quick questions
- Text selection context detection
- Semantic search with 0.5 similarity threshold
- Citation extraction and linking
- Greeting responses

## 📖 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Create a feature branch from `main`
2. Make changes and test locally
3. Commit with descriptive messages
4. Push to GitHub
5. Create Pull Request to `main`
6. GitHub Actions will automatically deploy on merge

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

Built with modern web technologies and AI-powered tools:

- **Docusaurus** for the amazing static site framework
- **OpenAI** for GPT-4o-mini language model
- **Google** for Gemini embeddings
- **Qdrant** for vector search capabilities
- **HuggingFace** for backend hosting

---

**Author**: ABIHA AHMED
**Repository**: [https://github.com/ABIHAAHEMD4262/Humanoid-Robotics-Book](https://github.com/ABIHAAHEMD4262/Humanoid-Robotics-Book)
**Live Demo**: [https://ABIHAAHEMD4262.github.io/Humanoid-Robotics-Book/](https://ABIHAAHEMD4262.github.io/Humanoid-Robotics-Book/)
