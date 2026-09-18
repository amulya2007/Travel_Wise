from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ChecklistItemBase(BaseModel):
    item: str
    category: Optional[str] = "General"
    is_completed: bool = False
    is_custom: bool = False


class ChecklistItemCreate(BaseModel):
    item: str
    category: Optional[str] = "Custom"
    is_completed: bool = False


class ChecklistItemUpdate(BaseModel):
    is_completed: Optional[bool] = None
    item: Optional[str] = None
    category: Optional[str] = None


class ChecklistItemResponse(ChecklistItemBase):
    id: int
    checklist_id: int

    model_config = ConfigDict(from_attributes=True)


class ChecklistResponse(BaseModel):
    id: int
    trip_id: int
    total_items: int = 0
    completed_items: int = 0
    progress_percentage: float = 0.0
    items: List[ChecklistItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
