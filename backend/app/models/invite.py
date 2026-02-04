# app/models/invite.py
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship

class Invite(Base):
    __tablename__ = "invites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"))
    invited_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))  # Who sent the invite

    email = Column(String(255), nullable=False)
    role = Column(String(20), default="member")
    
    # New fields for invitation tracking
    invitee_name = Column(String(255), nullable=True)  # For new users
    invited_to_workspace_name = Column(String(255), nullable=True)  # Store workspace name

    token = Column(String(255), unique=True, index=True)
    status = Column(String(20), default="pending")  # pending/accepted/declined/expired

    expires_at = Column(DateTime)
    accepted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    workspace = relationship("Workspace", backref="invites")
    inviter = relationship("User", foreign_keys=[invited_by])