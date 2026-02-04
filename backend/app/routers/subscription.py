# app/routers/subscription.py 
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.dependencies import get_current_active_user
from app.schemas.subscription import SubscriptionResponse
from app.models.user import User
from app.models.subscription import Subscription

router = APIRouter(prefix="/subscription", tags=["workspaces"])


@router.get("/current-plan-details", response_model=SubscriptionResponse)
async def get_my_subscription(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get subscription details
    """
    subscription = db.query(Subscription).filter(
        Subscription.owner_id == current_user.id
    ).first()

    return subscription
