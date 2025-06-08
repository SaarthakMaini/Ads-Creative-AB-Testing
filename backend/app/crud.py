from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime
from . import models, schemas
from .models import Creative, Performance

# Product
def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(
        title=product.title,
        description=product.description,
        images=",".join(product.images)  # Convert list to string
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    # Convert back to schema response format
    return schemas.ProductOut(
        id=db_product.id,
        title=db_product.title,
        description=db_product.description,
        images=db_product.images.split(",")  # String to list
    )


def get_product(db: Session, product_id: int):
    db_product = db.query(models.Product).get(product_id)
    return schemas.ProductOut(
        id=db_product.id,
        title=db_product.title,
        description=db_product.description,
        images=db_product.images.split(",")
    )


def get_products(db: Session):
    products = db.query(models.Product).all()
    return [
        schemas.ProductOut(
            id=p.id,
            title=p.title,
            description=p.description,
            images=p.images.split(",")
        )
        for p in products
    ]

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
        variant_ids=','.join(map(str, test.variant_ids))  # store as CSV string
    )
    db.add(test_db)
    db.commit()
    db.refresh(test_db)

    variant_ids_list = list(map(int, test_db.variant_ids.split(','))) if test_db.variant_ids else []

    return {
        "id": test_db.id,
        "product_id": test_db.product_id,
        "variant_ids": variant_ids_list,
        "start_date": test_db.start_date,
        "end_date": test_db.end_date,
        "status": test_db.status,
    }


def get_abtests(db: Session):
    abtests = db.query(models.ABTest).all()
    results = []
    for test_db in abtests:
        variant_ids_list = list(map(int, test_db.variant_ids.split(','))) if test_db.variant_ids else []
        results.append({
            "id": test_db.id,
            "product_id": test_db.product_id,
            "variant_ids": variant_ids_list,
            "start_date": test_db.start_date,
            "end_date": test_db.end_date,
            "status": test_db.status,
        })
    return results

def get_abtest_by_id(db: Session, abtest_id: int):
    abtest_db = db.query(models.ABTest).filter(models.ABTest.id == abtest_id).first()
    if not abtest_db:
        return None

    variant_ids_list = list(map(int, abtest_db.variant_ids.split(','))) if abtest_db.variant_ids else []

    return {
        "id": abtest_db.id,
        "product_id": abtest_db.product_id,
        "variant_ids": variant_ids_list,
        "start_date": abtest_db.start_date,
        "end_date": abtest_db.end_date,
        "status": abtest_db.status,
    }

def log_performance(db: Session, perf: schemas.PerformanceCreate):
    record = models.Performance(**perf.dict())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_performance_by_test(db: Session, test_id: int):
    return db.query(models.Performance).filter(models.Performance.test_id == test_id).all()

def get_creatives(db: Session):
    return db.query(models.Creative).all()

def calculate_metrics(product_id: int, db: Session):
    variants = db.query(Creative).filter(Creative.product_id == product_id).all()
    result = []

    for variant in variants:
        performances = db.query(Performance).filter(Performance.variant_id == variant.id).all()
        impressions = sum(p.impressions for p in performances)
        clicks = sum(p.clicks for p in performances)
        conversions = sum(p.conversions for p in performances)

        ctr = clicks / impressions if impressions else 0
        cvr = conversions / clicks if clicks else 0
        imp_to_conv = conversions / impressions if impressions else 0

        result.append({
            "variant_id": variant.id,
            "ctr": round(ctr, 4),
            "cvr": round(cvr, 4),
            "impression_to_conversion": round(imp_to_conv, 4),
        })

    return result