from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime
from .models import Creative, Performance
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# User

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

# Product

def create_product(db: Session, product: schemas.ProductCreate, user_id: int):
    db_product = models.Product(
        title=product.title,
        description=product.description,
        images=",".join(product.images),
        user_id=user_id
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return schemas.ProductOut(
        id=db_product.id,
        title=db_product.title,
        description=db_product.description,
        images=db_product.images.split(","),
        user_id=db_product.user_id
    )

def get_product(db: Session, product_id: int, user_id: int):
    db_product = db.query(models.Product).filter(models.Product.id == product_id, models.Product.user_id == user_id).first()
    if not db_product:
        return None
    return schemas.ProductOut(
        id=db_product.id,
        title=db_product.title,
        description=db_product.description,
        images=db_product.images.split(","),
        user_id=db_product.user_id
    )

def get_products(db: Session, user_id: int):
    products = db.query(models.Product).filter(models.Product.user_id == user_id).all()
    return [
        schemas.ProductOut(
            id=p.id,
            title=p.title,
            description=p.description,
            images=p.images.split(","),
            user_id=p.user_id
        )
        for p in products
    ]

# Creative

def create_creative(db: Session, creative: schemas.CreativeCreate, user_id: int):
    data = creative.dict()
    data['user_id'] = user_id  # Overwrite or set user_id
    db_creative = models.Creative(**data)
    db.add(db_creative)
    db.commit()
    db.refresh(db_creative)
    return db_creative

def get_creatives_by_product(db: Session, product_id: int, user_id: int):
    return db.query(models.Creative).filter(models.Creative.product_id == product_id, models.Creative.user_id == user_id).all()

def get_creatives(db: Session, user_id: int):
    return db.query(models.Creative).filter(models.Creative.user_id == user_id).all()

# AB Test

def create_abtest(db: Session, test: schemas.ABTestCreate, user_id: int):
    test_db = models.ABTest(
        product_id=test.product_id,
        variant_ids=','.join(map(str, test.variant_ids)),
        user_id=user_id
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
        "user_id": test_db.user_id
    }

def get_abtests(db: Session, user_id: int):
    abtests = db.query(models.ABTest).filter(models.ABTest.user_id == user_id).all()
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
            "user_id": test_db.user_id
        })
    return results

def get_abtest_by_id(db: Session, abtest_id: int, user_id: int):
    abtest_db = db.query(models.ABTest).filter(models.ABTest.id == abtest_id, models.ABTest.user_id == user_id).first()
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
        "user_id": abtest_db.user_id
    }

def log_performance(db: Session, perf: schemas.PerformanceCreate, user_id: int):
    data = perf.dict()
    data['user_id'] = user_id  # Overwrite or set user_id
    record = models.Performance(**data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_performance_by_test(db: Session, test_id: int, user_id: int):
    return db.query(models.Performance).filter(models.Performance.test_id == test_id, models.Performance.user_id == user_id).all()

def calculate_metrics(product_id: int, db: Session, user_id: int):
    variants = db.query(Creative).filter(Creative.product_id == product_id, Creative.user_id == user_id).all()
    result = []
    for variant in variants:
        performances = db.query(Performance).filter(Performance.variant_id == variant.id, Performance.user_id == user_id).all()
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

def suggest_best_creative(db: Session, abtest_id: int, user_id: int):
    abtest = db.query(models.ABTest).filter(models.ABTest.id == abtest_id, models.ABTest.user_id == user_id).first()
    if not abtest:
        return None
    variant_ids = abtest.variant_ids_list
    best_cvr = -1
    best_creative = None
    for vid in variant_ids:
        performances = db.query(models.Performance).filter(models.Performance.variant_id == vid, models.Performance.user_id == user_id).all()
        clicks = sum(p.clicks for p in performances)
        conversions = sum(p.conversions for p in performances)
        cvr = conversions / clicks if clicks else 0
        if cvr > best_cvr:
            best_cvr = cvr
            best_creative = db.query(models.Creative).filter(models.Creative.id == vid).first()
    if best_creative:
        return {
            "id": best_creative.id,
            "headline": best_creative.headline,
            "description": best_creative.description,
            "image_url": best_creative.image_url,
            "cvr": round(best_cvr, 4)
        }
    return None