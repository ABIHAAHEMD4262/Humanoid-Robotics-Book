"""
Hugging Face Space entry point for RAG Chatbot Backend.
This file is required by HF Spaces to run the FastAPI application.
"""
import os
from src.main import app

# Hugging Face Spaces expects the app to be named 'app'
# The uvicorn command in HF Spaces will be: uvicorn app:app

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 7860))  # HF Spaces uses port 7860
    uvicorn.run(app, host="0.0.0.0", port=port)
