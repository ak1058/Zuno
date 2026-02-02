# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(255), nullable=True)
    verification_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Add these for future use (optional)
    is_active = Column(Boolean, default=True)
    profile_picture = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<User {self.email}>"