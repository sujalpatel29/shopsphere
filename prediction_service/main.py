import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from db import (
    fetch_all_active_product_ids,
    fetch_monthly_sales,
    fetch_product_price,
    product_exists,
)
from predictor import run_prediction
from schemas import PredictionResult

load_dotenv()

app = FastAPI(title="Sales Prediction Service", version="1.0.0")


def parse_allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS") or os.getenv("ALLOWED_ORIGIN") or ""
    parsed = [origin.strip() for origin in raw.split(",") if origin.strip()]
    return parsed or ["http://localhost:3000"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "sales-prediction"}


@app.get("/predict/{product_id}", response_model=PredictionResult)
def predict_single(product_id: int):
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="product_id must be a positive integer.")

    if not product_exists(product_id):
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found.")

    rows = fetch_monthly_sales(product_id)
    price = fetch_product_price(product_id)
    prediction = run_prediction(rows, price)
    return {"product_id": product_id, **prediction}


@app.get("/predict-all")
def predict_all():
    product_ids = fetch_all_active_product_ids()
    predictions = []

    for product_id in product_ids:
        rows = fetch_monthly_sales(product_id)
        if not rows:
            continue

        price = fetch_product_price(product_id)
        prediction = run_prediction(rows, price)
        predictions.append({"product_id": product_id, **prediction})

    return {"count": len(predictions), "predictions": predictions}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("SERVICE_PORT", 8000)),
        reload=True,
    )
