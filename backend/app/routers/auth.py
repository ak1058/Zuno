# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserVerify, Token, UserInDB, UserVerifyResponse
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

@router.post("/verify-email", response_model=UserVerifyResponse)
async def verify_email(verify_data: UserVerify, db: Session = Depends(get_db)):
    """
    Verify user's email with token
    """
    try:
        user = AuthService.verify_email(db, verify_data.token)
        return UserVerifyResponse(
            message="Email verified successfully",
            user_id=user.id,
            workspace_created=True
        )
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
    Login user and return access token
    """
    try:
        token = AuthService.login_user(db, login_data.email, login_data.password)
        return token
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/me", response_model=UserInDB)
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    """
    Get current user information
    """
    return current_user



# Optional: Implement resend verification if needed
@router.post("/resend-verification")
async def resend_verification_email(email: str, db: Session = Depends(get_db)):
    """
    Resend verification email
    """
    # Implement if needed
    pass