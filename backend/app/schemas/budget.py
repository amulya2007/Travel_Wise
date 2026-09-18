from typing import Optional, Dict
from pydantic import BaseModel


class BudgetCategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    description: str


class BudgetResponse(BaseModel):
    trip_id: int
    user_budget: float
    total_estimated_cost: float
    remaining_budget: float
    cost_per_traveler: float
    is_over_budget: bool
    budget_usage_percentage: float
    status: str  # "Within Budget", "Near Limit", "Exceeded"
    status_color: str  # "emerald", "amber", "rose"
    message: str
    breakdown: Dict[str, BudgetCategoryBreakdown]
