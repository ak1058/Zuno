import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class Invite(Base):
    __tablename__ = "invites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"))

    email = Column(String(255), nullable=False)
    role = Column(String(20), default="member")

    token = Column(String(255), unique=True, index=True)
    status = Column(String(20), default="pending")

    expires_at = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())