from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas, crud
from app.db import SessionLocal
from app.routes.auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@router.post("/", response_model=schemas.PerformanceOut)
def log_data(perf: schemas.PerformanceCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.log_performance(db, perf, user_id=current_user.id)

@router.get("/test/{test_id}", response_model=list[schemas.PerformanceOut])
def get_by_test(test_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_performance_by_test(db, test_id, user_id=current_user.id)

import random
from datetime import datetime

@router.post("/simulate/{test_id}")
def simulate_performance(test_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models import ABTest, Creative
    test = db.query(ABTest).filter(ABTest.id == test_id, ABTest.user_id == current_user.id).first()
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
        data.append(crud.log_performance(db, record, user_id=current_user.id))
    return data

@router.get("/metrics")
def get_metrics(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.calculate_metrics(product_id, db, user_id=current_user.id)

@router.get("/suggest/{abtest_id}")
def suggest_best_creative_route(abtest_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    result = crud.suggest_best_creative(db, abtest_id, user_id=current_user.id)
    if not result:
        return {"message": "No creatives found or no performance data available."}
    return result
