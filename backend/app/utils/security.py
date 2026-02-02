# app/utils/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings
import secrets
from datetime import timezone


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token creation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_email_verification_token(email: str):
    data = {"email": email}
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire, "type": "email_verification"})
    token = jwt.encode(data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token

def verify_token(token: str, token_type: str = "access"):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload
    except JWTError:
        return None

# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Generate random token for email verification (alternative method)
def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)