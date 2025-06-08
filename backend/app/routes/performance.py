from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas, crud
from app.db import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@router.post("/", response_model=schemas.PerformanceOut)
def log_data(perf: schemas.PerformanceCreate, db: Session = Depends(get_db)):
    return crud.log_performance(db, perf)

@router.get("/test/{test_id}", response_model=list[schemas.PerformanceOut])
def get_by_test(test_id: int, db: Session = Depends(get_db)):
    return crud.get_performance_by_test(db, test_id)

import random
from datetime import datetime

@router.post("/simulate/{test_id}")
def simulate_performance(test_id: int, db: Session = Depends(get_db)):
    from app.models import ABTest, Creative

    test = db.query(ABTest).filter(ABTest.id == test_id).first()
    if not test:
        return {"error": "Test not found"}

    variant_ids = list(map(int, test.variant_ids.split(',')))
    data = []
    for vid in variant_ids:
        impressions = random.randint(100, 1000)
        clicks = random.randint(0, impressions)
        conversions = random.randint(0, clicks)

        record = schemas.PerformanceCreate(
            test_id=test_id,
            variant_id=vid,
            impressions=impressions,
            clicks=clicks,
            conversions=conversions,
        )
        data.append(crud.log_performance(db, record))

    return data
