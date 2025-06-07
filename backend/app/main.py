from fastapi import FastAPI
from .db import Base, engine
from .routes import product, creative, abtest, performance

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(product.router)
app.include_router(creative.router)
app.include_router(abtest.router)
app.include_router(performance.router)

@app.get("/")
def root():
    return {"message": "Ad Creative A/B Testing API"}