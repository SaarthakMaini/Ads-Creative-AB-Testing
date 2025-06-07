from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

# Product
def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products(db: Session):
    return db.query(models.Product).all()

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

# Creative
def create_creative(db: Session, creative: schemas.CreativeCreate):
    db_creative = models.Creative(**creative.dict())
    db.add(db_creative)
    db.commit()
    db.refresh(db_creative)
    return db_creative

def get_creatives_by_product(db: Session, product_id: int):
    return db.query(models.Creative).filter(models.Creative.product_id == product_id).all()

# AB Test
def create_abtest(db: Session, test: schemas.ABTestCreate):
    test_db = models.ABTest(
        product_id=test.product_id,
        variant_ids=','.join(map(str, test.variant_ids))
    )
    db.add(test_db)
    db.commit()
    db.refresh(test_db)
    return test_db

def get_abtests(db: Session):
    return db.query(models.ABTest).all()