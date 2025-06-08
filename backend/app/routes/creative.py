from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas, crud
from app.db import SessionLocal
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@router.post("/", response_model=schemas.CreativeOut)
def create(creative: schemas.CreativeCreate, db: Session = Depends(get_db)):
    return crud.create_creative(db, creative)

@router.get("/product/{product_id}", response_model=list[schemas.CreativeOut])
def read_by_product(product_id: int, db: Session = Depends(get_db)):
    return crud.get_creatives_by_product(db, product_id)

@router.get("/", response_model=List[schemas.CreativeOut])
def read_all(db: Session = Depends(get_db)):
    return crud.get_creatives(db)
