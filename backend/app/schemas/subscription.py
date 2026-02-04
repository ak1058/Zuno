from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class SubscriptionResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    plan: str
    seats: int
    status: str
    current_period_end: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
