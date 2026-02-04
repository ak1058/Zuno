# app/services/auth_service.py (updated)
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    verify_token,
    generate_verification_token
)
from app.services.email_service import EmailService
from app.services.workspace_service import WorkspaceService
from app.config import settings
from app.models.subscription import Subscription


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
        
        verification_link = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
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
        
        # Mark user as verified
        user.is_verified = True
        user.verification_token = None
        user.verification_token_expires = None
        db.commit()
        db.refresh(user)
        
        # Create Free subscription and default workspace for the user
        try:
            # 1️⃣ Create FREE subscription for owner
            subscription = Subscription(
                owner_id=user.id,
                plan="free",
                status="active"
            )
            db.add(subscription)
            db.commit()

            # 2️⃣ Create default workspace
            WorkspaceService.create_default_workspace_for_user(
                db=db,
                user_id=user.id,
                user_full_name=user.full_name
            )

        except Exception as e:
            # Even if workspace creation fails, user should still be verified
            # We can  log this error for debugging
            print(f"Workspace creation failed for user {user.id}: {str(e)}")
            # We can decide whether to rollback user verification or continue
            # For now, we'll continue since user is verified
        
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
    # Login - ONLY ACCESS TOKEN
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
            data={"sub": user.email, "user_id": str(user.id)}

        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
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
                detail="Invalid or expired token"
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
    

    @staticmethod
    def register_invited_user(db: Session, email: str, full_name: str, password: str):
        """
        Register a user who came through an invitation
        - Auto-verifies email since they were invited
        - Creates subscription
        - Creates personal workspace
        """
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            if existing_user.is_verified:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered and verified"
                )
            else:
                # Update existing unverified user
                existing_user.full_name = full_name
                existing_user.hashed_password = get_password_hash(password)
                existing_user.is_verified = True
                existing_user.verification_token = None
                existing_user.verification_token_expires = None
                db.commit()
                db.refresh(existing_user)
                user = existing_user
        else:
            # Create new user
            user = User(
                full_name=full_name,
                email=email,
                hashed_password=get_password_hash(password),
                is_verified=True,  # Auto-verify for invited users
                is_active=True
            )
            
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create FREE subscription
        subscription = Subscription(
            owner_id=user.id,
            plan="free",
            status="active"
        )
        db.add(subscription)
        db.commit()
        
        # Create default workspace
        WorkspaceService.create_default_workspace_for_user(
            db=db,
            user_id=user.id,
            user_full_name=user.full_name
        )
        
        return user