"""Initial schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2025-12-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create sessions table
    op.create_table('sessions',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('thread_id', sa.String(length=255), nullable=False),
    sa.Column('user_id', sa.String(length=255), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('last_active_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('device_info', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('thread_id')
    )
    op.create_index(op.f('ix_sessions_thread_id'), 'sessions', ['thread_id'], unique=True)

    # Create messages table
    op.create_table('messages',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('message_id', sa.String(length=255), nullable=True),
    sa.Column('thread_id', sa.String(length=255), nullable=False),
    sa.Column('role', sa.String(length=20), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('selected_text', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_messages_session_id'), 'messages', ['session_id'], unique=False)
    op.create_index(op.f('ix_messages_thread_id'), 'messages', ['thread_id'], unique=False)

    # Create citations table
    op.create_table('citations',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('message_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('chapter_title', sa.String(length=255), nullable=False),
    sa.Column('section_title', sa.String(length=255), nullable=False),
    sa.Column('url_fragment', sa.String(length=255), nullable=True),
    sa.Column('passage_text', sa.Text(), nullable=True),
    sa.Column('similarity_score', sa.Float(), nullable=True),
    sa.Column('qdrant_point_id', sa.String(length=255), nullable=True),
    sa.ForeignKeyConstraint(['message_id'], ['messages.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_citations_message_id'), 'citations', ['message_id'], unique=False)

    # Create analytics_events table
    op.create_table('analytics_events',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('query_text', sa.Text(), nullable=False),
    sa.Column('query_topics', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('chapters_referenced', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('answered_successfully', sa.Boolean(), nullable=False),
    sa.Column('response_time_ms', sa.Integer(), nullable=True),
    sa.Column('selected_text_used', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_analytics_events_created_at'), 'analytics_events', ['created_at'], unique=False)
    op.create_index(op.f('ix_analytics_events_session_id'), 'analytics_events', ['session_id'], unique=False)

    # Create book_sections table
    op.create_table('book_sections',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('section_id', sa.String(length=255), nullable=False),
    sa.Column('chapter_title', sa.String(length=255), nullable=False),
    sa.Column('section_title', sa.String(length=255), nullable=False),
    sa.Column('url_fragment', sa.String(length=255), nullable=False),
    sa.Column('qdrant_point_ids', postgresql.JSON(astext_type=sa.Text()), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('section_id')
    )
    op.create_index(op.f('ix_book_sections_section_id'), 'book_sections', ['section_id'], unique=True)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index(op.f('ix_book_sections_section_id'), table_name='book_sections')
    op.drop_table('book_sections')

    op.drop_index(op.f('ix_analytics_events_session_id'), table_name='analytics_events')
    op.drop_index(op.f('ix_analytics_events_created_at'), table_name='analytics_events')
    op.drop_table('analytics_events')

    op.drop_index(op.f('ix_citations_message_id'), table_name='citations')
    op.drop_table('citations')

    op.drop_index(op.f('ix_messages_thread_id'), table_name='messages')
    op.drop_index(op.f('ix_messages_session_id'), table_name='messages')
    op.drop_table('messages')

    op.drop_index(op.f('ix_sessions_thread_id'), table_name='sessions')
    op.drop_table('sessions')
