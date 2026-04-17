from __future__ import annotations

from datetime import datetime
import warnings

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

try:
    from prophet import Prophet
except Exception:  # pragma: no cover - runtime safeguard if Prophet is unavailable
    Prophet = None


def rows_to_df(rows: list[dict]) -> pd.DataFrame:
    if not rows:
        return pd.DataFrame(columns=["month", "qty", "revenue"])

    frame = pd.DataFrame(rows).copy()
    frame["month"] = pd.to_datetime(frame["month"])
    frame["qty"] = frame["qty"].astype(float)
    frame["revenue"] = frame["revenue"].astype(float)
    return frame.sort_values("month").reset_index(drop=True)


def next_month_start(frame: pd.DataFrame) -> pd.Timestamp:
    if frame.empty:
        now = pd.Timestamp(datetime.utcnow()).normalize()
        return now + pd.offsets.MonthBegin(1)
    return frame["month"].max() + pd.offsets.MonthBegin(1)


def clamp_r2(value: float | None) -> float | None:
    if value is None:
        return None
    return round(max(0.0, min(1.0, float(value))), 4)


def predict_with_prophet(frame: pd.DataFrame, price: float) -> dict:
    if Prophet is None:
        raise RuntimeError("Prophet is not installed.")

    prophet_frame = frame.rename(columns={"month": "ds", "qty": "y"})[["ds", "y"]]
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        seasonality_mode="multiplicative",
        changepoint_prior_scale=0.15,
    )
    model.fit(prophet_frame)

    forecast = model.predict(model.make_future_dataframe(periods=1, freq="MS"))
    predicted_qty = max(0.0, float(forecast.iloc[-1]["yhat"]))

    fitted = forecast.iloc[:-1]["yhat"].values
    actual = prophet_frame["y"].values
    r2 = clamp_r2(r2_score(actual, fitted)) if len(actual) >= 2 else None

    return {
        "predicted_month": str(next_month_start(frame).date()),
        "predicted_qty": round(predicted_qty, 2),
        "predicted_revenue": round(predicted_qty * price, 2),
        "confidence_score": r2,
        "model_used": "prophet",
    }


def predict_with_regression(frame: pd.DataFrame, price: float) -> dict:
    working = frame.copy()
    working["t"] = np.arange(len(working))
    working["month_num"] = working["month"].dt.month

    x = working[["t", "month_num"]].values
    y = working["qty"].values

    scaler = StandardScaler()
    x_scaled = scaler.fit_transform(x)

    model = LinearRegression()
    model.fit(x_scaled, y)

    next_month = next_month_start(working)
    next_vector = scaler.transform([[len(working), next_month.month]])
    predicted_qty = max(0.0, float(model.predict(next_vector)[0]))

    r2 = clamp_r2(r2_score(y, model.predict(x_scaled))) if len(y) >= 2 else None

    return {
        "predicted_month": str(next_month.date()),
        "predicted_qty": round(predicted_qty, 2),
        "predicted_revenue": round(predicted_qty * price, 2),
        "confidence_score": r2,
        "model_used": "linear_regression",
    }


def _historical_payload(frame: pd.DataFrame) -> list[dict]:
    return [
        {
            "month": str(row["month"].date()),
            "qty": float(row["qty"]),
            "revenue": float(row["revenue"]),
        }
        for _, row in frame.iterrows()
    ]


def run_prediction(rows: list[dict], price: float) -> dict:
    frame = rows_to_df(rows)

    if len(frame) < 2:
        return {
            "predicted_month": str(next_month_start(frame).date()),
            "predicted_qty": 0.0,
            "predicted_revenue": 0.0,
            "confidence_score": None,
            "model_used": "insufficient_data",
            "historical": _historical_payload(frame),
            "error": "Insufficient data: at least 2 monthly points are required.",
        }

    try:
        if len(frame) >= 6:
            output = predict_with_prophet(frame, price)
        else:
            output = predict_with_regression(frame, price)
    except Exception:
        output = predict_with_regression(frame, price)
        output["model_used"] = "linear_regression_fallback"
    
    output["historical"] = _historical_payload(frame)
    output["error"] = None
    return output
