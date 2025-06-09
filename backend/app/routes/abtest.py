from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud
from app.db import SessionLocal
from app.routes.auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@router.post("/", response_model=schemas.ABTestOut)
def create(test: schemas.ABTestCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.create_abtest(db, test, user_id=current_user.id)

@router.get("/", response_model=list[schemas.ABTestOut])
def read_all(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_abtests(db, user_id=current_user.id)

@router.get("/{abtest_id}", response_model=schemas.ABTestOut)
def read_abtest(abtest_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    abtest = crud.get_abtest_by_id(db, abtest_id, user_id=current_user.id)
    if abtest is None:
        raise HTTPException(status_code=404, detail="ABTest not found")
    return abtest
