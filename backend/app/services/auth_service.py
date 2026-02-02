# app/services/auth_service.py

from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
    generate_verification_token
)
from app.services.email_service import EmailService
from app.config import settings


class AuthService:

    # -----------------------------
    # Register User
    # -----------------------------
    @staticmethod
    def register_user(db: Session, user_data: UserCreate):

        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        verification_token = generate_verification_token()

        db_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            is_verified=False,
            verification_token=verification_token,
            verification_token_expires=datetime.now(timezone.utc) + timedelta(days=1)
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        verification_link = (
            f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        )

        EmailService.send_verification_email(
            to_email=user_data.email,
            verification_link=verification_link,
            user_name=user_data.full_name
        )

        return db_user

    # -----------------------------
    # Verify Email
    # -----------------------------
    @staticmethod
    def verify_email(db: Session, token: str):

        user = db.query(User).filter(
            User.verification_token == token,
            User.verification_token_expires > datetime.now(timezone.utc)
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )

        user.is_verified = True
        user.verification_token = None
        user.verification_token_expires = None

        db.commit()
        db.refresh(user)

        return user

    # -----------------------------
    # Authenticate (password check)
    # -----------------------------
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str):

        user = db.query(User).filter(User.email == email).first()

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    # -----------------------------
    # Login
    # -----------------------------
    @staticmethod
    def login_user(db: Session, email: str, password: str):

        user = AuthService.authenticate_user(db, email, password)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        if not user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Please verify your email before logging in"
            )

        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id}
        )

        refresh_token = create_refresh_token(
            data={"sub": user.email, "user_id": user.id}
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    # -----------------------------
    # Get Current User from token
    # -----------------------------
    @staticmethod
    def get_current_user(db: Session, token: str):

        payload = verify_token(token)

        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        email = payload.get("sub")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        user = db.query(User).filter(User.email == email).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        return user
