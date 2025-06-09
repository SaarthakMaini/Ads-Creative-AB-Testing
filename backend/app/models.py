from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    products = relationship("Product", back_populates="user")
    creatives = relationship("Creative", back_populates="user")
    abtests = relationship("ABTest", back_populates="user")
    performances = relationship("Performance", back_populates="user")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(Text)
    images = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="products")
    creatives = relationship("Creative", back_populates="product")


class Creative(Base):
    __tablename__ = "creatives"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    image_url = Column(String)
    headline = Column(String)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="creatives")
    product = relationship("Product", back_populates="creatives")


class ABTest(Base):
    __tablename__ = "ab_tests"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    variant_ids = Column(Text)  # comma-separated
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    status = Column(String, default="running")
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="abtests")

    @property
    def variant_ids_list(self):
        if self.variant_ids:
            return list(map(int, self.variant_ids.split(',')))
        return []


class Performance(Base):
    __tablename__ = "performance"

    id = Column(Integer, primary_key=True)
    test_id = Column(Integer, ForeignKey("ab_tests.id"))
    variant_id = Column(Integer, ForeignKey("creatives.id"))
    impressions = Column(Integer)
    clicks = Column(Integer)
    conversions = Column(Integer)
    timestamp = Column(DateTime, default=datetime.now)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="performances")