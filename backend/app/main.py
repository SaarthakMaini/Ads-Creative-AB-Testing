from fastapi import FastAPI
from .db import Base, engine
from .routes import product, creative, abtest, performance
from .routes import auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(product.router, prefix="/products", tags=["Products"])
app.include_router(creative.router, prefix="/creatives", tags=["Creatives"])
app.include_router(abtest.router, prefix="/tests", tags=["AB Tests"])
app.include_router(performance.router, prefix="/performance", tags=["Performance"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

@app.get("/")
def home():
    return {"Home Page": "Ad Creative A/B Testing API"}