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

@router.post("/", response_model=schemas.ProductOut)
def create(product: schemas.ProductCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.create_product(db, product, user_id=current_user.id)

@router.get("/", response_model=list[schemas.ProductOut])
def read_all(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_products(db, user_id=current_user.id)

@router.get("/{product_id}", response_model=schemas.ProductOut)
def read_one(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_product(db, product_id, user_id=current_user.id)
