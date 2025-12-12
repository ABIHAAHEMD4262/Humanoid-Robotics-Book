"""
SQLAlchemy models for Neon Serverless Postgres.
Stores conversation threads, messages, sessions, citations, and analytics.
"""
from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Text, Float, Boolean, Integer, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Session(Base):
    """
    User session tracking.
    Maps browser sessions to OpenAI Assistant threads.
    """
    __tablename__ = 'sessions'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(String(255), unique=True, index=True, nullable=False)  # OpenAI thread ID
    user_id = Column(String(255), nullable=True)  # Optional for authenticated users
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_active_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    device_info = Column(JSON, nullable=True)  # Browser, OS, screen size

    # Relationships
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")
    analytics_events = relationship("AnalyticsEvent", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Session(id={self.id}, thread_id={self.thread_id})>"


class Message(Base):
    """
    Individual messages in conversations.
    Stores both user queries and assistant responses.
    """
    __tablename__ = 'messages'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(PGUUID(as_uuid=True), ForeignKey('sessions.id', ondelete='CASCADE'), nullable=False, index=True)
    message_id = Column(String(255), nullable=True)  # OpenAI message ID
    thread_id = Column(String(255), nullable=False, index=True)  # OpenAI thread ID
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)  # Message content
    selected_text = Column(Text, nullable=True)  # User-selected text (for user messages only)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    session = relationship("Session", back_populates="messages")
    citations = relationship("Citation", back_populates="message", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Message(id={self.id}, role={self.role}, session_id={self.session_id})>"


class Citation(Base):
    """
    Source citations for assistant responses.
    Links answers back to specific book sections.
    """
    __tablename__ = 'citations'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(PGUUID(as_uuid=True), ForeignKey('messages.id', ondelete='CASCADE'), nullable=False, index=True)
    chapter_title = Column(String(255), nullable=False)
    section_title = Column(String(255), nullable=False)
    url_fragment = Column(String(255), nullable=True)  # e.g., #ros2-nodes
    passage_text = Column(Text, nullable=True)  # Excerpt from book
    similarity_score = Column(Float, nullable=True)  # Cosine similarity from vector search
    qdrant_point_id = Column(String(255), nullable=True)  # Reference to Qdrant vector

    # Relationships
    message = relationship("Message", back_populates="citations")

    def __repr__(self):
        return f"<Citation(id={self.id}, chapter={self.chapter_title}, section={self.section_title})>"


class AnalyticsEvent(Base):
    """
    Anonymized query analytics.
    Tracks topics, performance, and usage patterns without PII.
    """
    __tablename__ = 'analytics_events'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(PGUUID(as_uuid=True), ForeignKey('sessions.id', ondelete='CASCADE'), nullable=False, index=True)
    query_text = Column(Text, nullable=False)  # User's question
    query_topics = Column(JSON, nullable=True)  # Extracted keywords: ["ROS2", "navigation"]
    chapters_referenced = Column(JSON, nullable=True)  # Chapters cited in answer
    answered_successfully = Column(Boolean, nullable=False, default=True)
    response_time_ms = Column(Integer, nullable=True)  # Time to generate answer
    selected_text_used = Column(Boolean, nullable=False, default=False)  # Whether text selection was used
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    session = relationship("Session", back_populates="analytics_events")

    def __repr__(self):
        return f"<AnalyticsEvent(id={self.id}, answered={self.answered_successfully})>"


class BookSection(Base):
    """
    Metadata about book sections for citation mapping.
    Maps Qdrant vector IDs to book structure.
    """
    __tablename__ = 'book_sections'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_id = Column(String(255), unique=True, nullable=False, index=True)  # e.g., "module1-ros2-ch1-nodes"
    chapter_title = Column(String(255), nullable=False)
    section_title = Column(String(255), nullable=False)
    url_fragment = Column(String(255), nullable=False)  # Docusaurus URL path
    qdrant_point_ids = Column(JSON, nullable=False)  # Array of Qdrant vector IDs
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<BookSection(section_id={self.section_id}, chapter={self.chapter_title})>"
