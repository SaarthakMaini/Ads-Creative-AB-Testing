from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProductCreate(BaseModel):
    title: str
    description: str
    images: List[str]

class ProductOut(ProductCreate):
    id: int

class CreativeCreate(BaseModel):
    product_id: int
    image_url: str
    headline: str
    description: str

class CreativeOut(CreativeCreate):
    id: int

class ABTestCreate(BaseModel):
    product_id: int
    variant_ids: List[int]

class ABTestOut(BaseModel):
    id: int
    product_id: int
    variant_ids: List[int]
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None

class PerformanceCreate(BaseModel):
    test_id: int
    variant_id: int
    impressions: int
    clicks: int
    conversions: int

class PerformanceOut(PerformanceCreate):
    id: int
    timestamp: datetime
    class Config:
        orm_mode = True