# RAG Chatbot for Physical AI & Humanoid Robotics Book

An AI-powered chatbot widget that helps readers explore your Docusaurus book content using Retrieval-Augmented Generation (RAG).

## ✨ Features

- 💬 **Floating Widget**: Beautiful chat button in the bottom-right corner
- 🤖 **AI-Powered**: GPT-4o-mini generates accurate answers
- 📚 **Context-Aware**: Searches your book content using vector embeddings
- 🔗 **Source Citations**: Every answer includes links to relevant book sections
- 📱 **Responsive**: Works perfectly on mobile and desktop
- 🌙 **Dark Mode**: Automatic dark mode support
- ⚡ **Fast**: Optimized for performance
- 🔒 **Secure**: Rate limiting and input validation

## 📁 Project Structure

```
chatbot/
├── backend/                    # FastAPI backend
│   ├── src/                   # Source code
│   ├── scripts/               # Utility scripts
│   ├── Dockerfile             # HF Spaces deployment
│   └── README_HF_DEPLOYMENT.md
│
├── docusaurus-plugin/          # Docusaurus plugin
│   ├── src/theme/             # React components
│   └── README.md
│
├── INTEGRATION_GUIDE.md        # Step-by-step integration
└── README.md                   # This file
```

## 🚀 Quick Start

See **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** for complete walkthrough.

## 💰 Cost Estimation

- **Monthly**: ~$0.50 for 1000 queries
- **Your $5 credit**: ~10,000 queries

## 📚 Documentation

- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Complete setup
- **[backend/README_HF_DEPLOYMENT.md](./backend/README_HF_DEPLOYMENT.md)** - HF deployment
- **[docusaurus-plugin/README.md](./docusaurus-plugin/README.md)** - Plugin docs

## 🎉 Status

- ✅ Backend: Complete and tested
- ✅ Frontend: Complete
- ✅ Plugin: Complete with floating widget
- ⏳ Ready for deployment!

---

Built with ❤️ for the Physical AI & Humanoid Robotics community
