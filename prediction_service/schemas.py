from typing import Optional

from pydantic import BaseModel


class MonthlyDataPoint(BaseModel):
    month: str
    qty: float
    revenue: float


class PredictionResult(BaseModel):
    product_id: int
    predicted_month: str
    predicted_qty: float
    predicted_revenue: float
    confidence_score: Optional[float]
    model_used: str
    historical: list[MonthlyDataPoint]
    error: Optional[str] = None
