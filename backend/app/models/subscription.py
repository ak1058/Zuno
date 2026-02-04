# app/models/subscription.py
import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    owner_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    plan = Column(String(50), default="free")

    status = Column(String(20), default="active")  # active/paused/cancelled

    current_period_end = Column(DateTime)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")
