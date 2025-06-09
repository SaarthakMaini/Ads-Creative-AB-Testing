from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str

class ProductCreate(BaseModel):
    title: str
    description: str
    images: List[str]
    user_id: Optional[int] = None

class ProductOut(ProductCreate):
    id: int
    user_id: int

class CreativeCreate(BaseModel):
    product_id: int
    image_url: str
    headline: str
    description: str
    user_id: Optional[int] = None

class CreativeOut(CreativeCreate):
    id: int
    user_id: int

class ABTestCreate(BaseModel):
    product_id: int
    variant_ids: List[int]
    user_id: Optional[int] = None

class ABTestOut(BaseModel):
    id: int
    product_id: int
    variant_ids: List[int]
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    user_id: int

class PerformanceCreate(BaseModel):
    test_id: int
    variant_id: int
    impressions: int
    clicks: int
    conversions: int
    user_id: Optional[int] = None

class PerformanceOut(PerformanceCreate):
    id: int
    timestamp: datetime
    user_id: int
    class Config:
        orm_mode = True