# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserVerify, Token, UserInDB
from app.services.auth_service import AuthService
from app.utils.dependencies import get_current_active_user

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserInDB)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user
    """
    try:
        user = AuthService.register_user(db, user_data)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/verify-email")
async def verify_email(verify_data: UserVerify, db: Session = Depends(get_db)):
    """
    Verify user's email with token
    """
    try:
        user = AuthService.verify_email(db, verify_data.token)
        return {"message": "Email verified successfully", "user_id": user.id}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login user and return access & refresh tokens
    """
    try:
        tokens = AuthService.login_user(db, login_data.email, login_data.password)
        return tokens
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/refresh-token", response_model=Token)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token
    """
    # You'll need to implement this based on your refresh token strategy
    pass

@router.get("/me", response_model=UserInDB)
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    """
    Get current user information
    """
    return current_user

@router.post("/resend-verification")
async def resend_verification_email(email: str, db: Session = Depends(get_db)):
    """
    Resend verification email
    """
    # You can implement this to resend verification email
    pass