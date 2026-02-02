# app/config.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Email
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    FROM_EMAIL: str
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"

settings = Settings()