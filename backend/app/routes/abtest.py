from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas, crud
from app.db import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@router.post("/", response_model=schemas.ABTestOut)
def create(test: schemas.ABTestCreate, db: Session = Depends(get_db)):
    return crud.create_abtest(db, test)

@router.get("/", response_model=list[schemas.ABTestOut])
def read_all(db: Session = Depends(get_db)):
    return crud.get_abtests(db)
