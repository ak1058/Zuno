# app/schemas/subscription.py
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class SubscriptionResponse(BaseModel):
    id: UUID
    owner_id: UUID   
    plan: str
    status: str
    current_period_end: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True

