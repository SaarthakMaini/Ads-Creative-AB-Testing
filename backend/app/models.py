from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(Text)
    images = Column(Text)

    creatives = relationship("Creative", back_populates="product")


class Creative(Base):
    __tablename__ = "creatives"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    image_url = Column(String)
    headline = Column(String)
    description = Column(Text)

    product = relationship("Product", back_populates="creatives")


class ABTest(Base):
    __tablename__ = "ab_tests"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    variant_ids = Column(Text)  # comma-separated
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    status = Column(String, default="running")


class Performance(Base):
    __tablename__ = "performance"

    id = Column(Integer, primary_key=True)
    test_id = Column(Integer, ForeignKey("ab_tests.id"))
    variant_id = Column(Integer, ForeignKey("creatives.id"))
    impressions = Column(Integer)
    clicks = Column(Integer)
    conversions = Column(Integer)
    timestamp = Column(DateTime, default=datetime.now)