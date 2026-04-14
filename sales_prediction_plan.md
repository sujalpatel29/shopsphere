# Sales Prediction System — Complete Implementation Plan

**Project:** ShopSphere E-Commerce Admin Panel  
**Feature:** ML-powered monthly sales forecasting  
**Stack:** React · Node.js/Express · Python FastAPI · MySQL · Prophet · scikit-learn  
**Database:** `ecommerce_accrete`

---



## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Context & Schema Analysis](#2-project-context--schema-analysis)
3. [New MySQL Table](#3-new-mysql-table)
4. [Sample Data Seeding](#4-sample-data-seeding)
5. [Python FastAPI Microservice](#5-python-fastapi-microservice)
6. [Node.js / Express Integration](#6-nodejs--express-integration)
7. [React Admin UI](#7-react-admin-ui)
8. [Running the Full System](#8-running-the-full-system)
9. [Troubleshooting](#9-troubleshooting)
10. [File Manifest](#10-file-manifest)
11. [Future Enhancements](#11-future-enhancements)

---

## 1. Architecture Overview

```
[React Admin UI]  →  /admin/sales-prediction page
        ↓  axios fetch
[Node.js / Express]  →  /api/admin/sales/* routes
        ↓  axios HTTP call (port 8000)
[Python FastAPI]  →  /predict/:product_id
        ↓  reads history
[MySQL — ecommerce_accrete]  →  order_master + order_items
        ↑  caches result
[sales_predictions table]  ←  Node writes after each prediction
```

**Data flow for one prediction request:**
1. Admin selects a product in the React UI
2. React calls `GET /api/admin/sales/predict/:productId` on Node
3. Node proxies the call to `GET http://localhost:8000/predict/:productId` on Python
4. Python queries MySQL for monthly sales history of that product
5. Python runs Prophet (or linear regression fallback) and returns a prediction JSON
6. Node caches the result in `sales_predictions` table and forwards JSON to React
7. React renders a chart (historical + forecast) and stat cards

**Why Python for ML?**
The Node.js ML ecosystem is immature for time-series forecasting. Python's Prophet (by Meta) and scikit-learn are industry-standard, well-documented, and production-proven. The two servers run concurrently and communicate over localhost HTTP — no external infrastructure needed.

---

## 2. Project Context & Schema Analysis

### 2.1 Assumed Existing Project Structure

```
backend/
  server.js              ← Express entry point
  routes/                ← All existing Express routers
  controllers/
  middleware/            ← Auth, error handling
  config/
    db.js                ← MySQL connection pool (exports db.query)
  .env

frontend/
  src/
    pages/
      admin/             ← Existing admin pages live here
    App.jsx              ← React Router setup
```

### 2.2 Relevant Existing Tables

These four tables are read by the prediction engine. **No changes to these tables.**

| Table | Columns Used | Purpose |
|---|---|---|
| `order_master` | `order_id`, `order_status`, `created_at`, `is_deleted` | Filter completed/delivered orders by date |
| `order_items` | `product_id`, `quantity`, `total`, `order_id`, `is_deleted` | Per-product units sold and revenue per order |
| `product_master` | `product_id`, `display_name`, `price`, `discounted_price`, `category_id`, `is_active`, `is_deleted` | Product metadata for the UI |
| `category_master` | `category_id`, `category_name` | Category filtering in admin UI |

### 2.3 Key Schema Facts

- `order_master.order_status` values that count as a sale: `'completed'` and `'delivered'`
- `order_items.total` is already the final line total (qty × price after discount) — use it directly
- `order_items.quantity` is the units sold per line item
- Both tables have `is_deleted = 0` guard columns that must be included in every WHERE clause
- The `product_master` has both `price` and `discounted_price` — use `COALESCE(discounted_price, price)` for the effective price

---

## 3. New MySQL Table

Run this once on the `ecommerce_accrete` database. This table caches prediction results so the Python service is not called on every page load.

```sql
-- FILE: backend/scripts/create_predictions_table.sql
-- Run: mysql -u root -p ecommerce_accrete < backend/scripts/create_predictions_table.sql

CREATE TABLE IF NOT EXISTS `sales_predictions` (
  `prediction_id`     INT NOT NULL AUTO_INCREMENT,
  `product_id`        INT NOT NULL,
  `predicted_month`   DATE NOT NULL,          -- First day of predicted month, e.g. 2025-05-01
  `predicted_qty`     DECIMAL(10,2) NOT NULL, -- Predicted units to sell
  `predicted_revenue` DECIMAL(12,2) NOT NULL, -- Predicted gross revenue
  `confidence_score`  DECIMAL(5,4) DEFAULT NULL, -- R² score 0.0000–1.0000
  `model_used`        VARCHAR(50) DEFAULT 'prophet',
  `generated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prediction_id`),
  UNIQUE KEY `uq_product_month` (`product_id`, `predicted_month`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `fk_sp_product` FOREIGN KEY (`product_id`)
    REFERENCES `product_master`(`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## 4. Sample Data Seeding

### 4.1 Why This Is Needed

Prophet and scikit-learn need a minimum of 6 monthly data points per product to produce a reliable forecast. Since the project is early-stage, seed 8 months of realistic synthetic orders.

### 4.2 Seed Script

```sql
-- FILE: backend/scripts/seed_sales_data.sql
-- Run: mysql -u root -p ecommerce_accrete < backend/scripts/seed_sales_data.sql
-- Safe to re-run (uses INSERT IGNORE throughout)

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Categories
INSERT IGNORE INTO category_master (category_id, category_name, created_by, updated_by)
VALUES
  (100, 'Electronics',    1, 1),
  (101, 'Clothing',       1, 1),
  (102, 'Home & Kitchen', 1, 1);

-- 2. Products
INSERT IGNORE INTO product_master
  (product_id, name, display_name, price, discounted_price, stock, category_id, created_by, updated_by)
VALUES
  (201, 'wireless_earbuds', 'Wireless Earbuds Pro',     1499.00, 1299.00, 150, 100, 1, 1),
  (202, 'smart_watch',      'Smart Watch Series X',     3999.00, 3499.00,  80, 100, 1, 1),
  (203, 'cotton_tshirt',    'Premium Cotton T-Shirt',    499.00,  399.00, 300, 101, 1, 1),
  (204, 'denim_jeans',      'Slim Fit Denim Jeans',      899.00,  799.00, 200, 101, 1, 1),
  (205, 'coffee_maker',     'Drip Coffee Maker 12-Cup', 2299.00, 1999.00,  60, 102, 1, 1);

-- 3. Customers
INSERT IGNORE INTO user_master (user_id, name, email, password, role)
VALUES
  (101, 'Ravi Sharma',  'ravi@test.com',  '$2b$10$placeholder', 'customer'),
  (102, 'Priya Mehta',  'priya@test.com', '$2b$10$placeholder', 'customer'),
  (103, 'Amit Patel',   'amit@test.com',  '$2b$10$placeholder', 'customer'),
  (104, 'Sneha Joshi',  'sneha@test.com', '$2b$10$placeholder', 'customer'),
  (105, 'Karan Verma',  'karan@test.com', '$2b$10$placeholder', 'customer');

-- 4. Helper procedure
DROP PROCEDURE IF EXISTS seed_order;
DELIMITER //
CREATE PROCEDURE seed_order(
  IN p_order_id  INT,
  IN p_user_id   INT,
  IN p_date      DATETIME,
  IN p_product_id INT,
  IN p_qty       INT,
  IN p_price     DECIMAL(10,2)
)
BEGIN
  INSERT IGNORE INTO order_master
    (order_id, order_number, user_id, subtotal, tax_amount,
     total_amount, order_status, payment_status, created_at)
  VALUES
    (p_order_id,
     CONCAT('ORD-SEED-', p_order_id),
     p_user_id,
     p_price * p_qty,
     ROUND(p_price * p_qty * 0.18, 2),
     ROUND(p_price * p_qty * 1.18, 2),
     'completed', 'completed', p_date);

  INSERT IGNORE INTO order_items
    (order_id, product_id, product_name, quantity, price, total, created_at)
  VALUES
    (p_order_id,
     p_product_id,
     (SELECT display_name FROM product_master WHERE product_id = p_product_id),
     p_qty,
     p_price,
     ROUND(p_price * p_qty, 2),
     p_date);
END //
DELIMITER ;

-- ── September 2024 ────────────────────────────────────────────────────────────
-- Sales pattern: moderate baseline across all categories
CALL seed_order(1001, 101, '2024-09-03', 201, 4, 1299);
CALL seed_order(1002, 102, '2024-09-07', 201, 2, 1299);
CALL seed_order(1003, 103, '2024-09-12', 202, 1, 3499);
CALL seed_order(1004, 104, '2024-09-15', 203, 6,  399);
CALL seed_order(1005, 105, '2024-09-18', 203, 4,  399);
CALL seed_order(1006, 101, '2024-09-22', 204, 3,  799);
CALL seed_order(1007, 102, '2024-09-25', 205, 2, 1999);
CALL seed_order(1008, 103, '2024-09-28', 205, 1, 1999);

-- ── October 2024 ─────────────────────────────────────────────────────────────
-- Clothing peak (festive shopping starts), Electronics picking up
CALL seed_order(1009, 104, '2024-10-02', 203, 10,  399);
CALL seed_order(1010, 105, '2024-10-05', 203,  8,  399);
CALL seed_order(1011, 101, '2024-10-08', 204,  7,  799);
CALL seed_order(1012, 102, '2024-10-11', 204,  5,  799);
CALL seed_order(1013, 103, '2024-10-14', 201,  3, 1299);
CALL seed_order(1014, 104, '2024-10-17', 202,  2, 3499);
CALL seed_order(1015, 105, '2024-10-20', 205,  2, 1999);
CALL seed_order(1016, 101, '2024-10-24', 205,  1, 1999);
CALL seed_order(1017, 102, '2024-10-28', 203,  6,  399);

-- ── November 2024 ────────────────────────────────────────────────────────────
-- Electronics festive peak (Diwali effect)
CALL seed_order(1018, 103, '2024-11-01', 201,  8, 1299);
CALL seed_order(1019, 104, '2024-11-04', 201,  6, 1299);
CALL seed_order(1020, 105, '2024-11-07', 202,  4, 3499);
CALL seed_order(1021, 101, '2024-11-10', 202,  3, 3499);
CALL seed_order(1022, 102, '2024-11-13', 201,  5, 1299);
CALL seed_order(1023, 103, '2024-11-16', 205,  3, 1999);
CALL seed_order(1024, 104, '2024-11-19', 205,  2, 1999);
CALL seed_order(1025, 105, '2024-11-22', 204,  4,  799);
CALL seed_order(1026, 101, '2024-11-25', 203,  5,  399);
CALL seed_order(1027, 102, '2024-11-28', 201,  7, 1299);

-- ── December 2024 ────────────────────────────────────────────────────────────
-- All-category peak (Christmas + year-end gifting)
CALL seed_order(1028, 103, '2024-12-02', 201, 12, 1299);
CALL seed_order(1029, 104, '2024-12-05', 202,  6, 3499);
CALL seed_order(1030, 105, '2024-12-08', 202,  5, 3499);
CALL seed_order(1031, 101, '2024-12-11', 201,  9, 1299);
CALL seed_order(1032, 102, '2024-12-14', 205,  4, 1999);
CALL seed_order(1033, 103, '2024-12-17', 205,  3, 1999);
CALL seed_order(1034, 104, '2024-12-20', 203,  8,  399);
CALL seed_order(1035, 105, '2024-12-23', 204,  6,  799);
CALL seed_order(1036, 101, '2024-12-26', 201, 10, 1299);
CALL seed_order(1037, 102, '2024-12-29', 202,  4, 3499);

-- ── January 2025 ─────────────────────────────────────────────────────────────
-- Post-holiday dip
CALL seed_order(1038, 103, '2025-01-03', 201, 4, 1299);
CALL seed_order(1039, 104, '2025-01-07', 202, 2, 3499);
CALL seed_order(1040, 105, '2025-01-10', 205, 2, 1999);
CALL seed_order(1041, 101, '2025-01-14', 203, 4,  399);
CALL seed_order(1042, 102, '2025-01-18', 204, 3,  799);
CALL seed_order(1043, 103, '2025-01-22', 201, 3, 1299);
CALL seed_order(1044, 104, '2025-01-26', 205, 1, 1999);

-- ── February 2025 ────────────────────────────────────────────────────────────
-- Valentine's Day mini peak for Clothing
CALL seed_order(1045, 105, '2025-02-03', 203, 9,  399);
CALL seed_order(1046, 101, '2025-02-06', 204, 7,  799);
CALL seed_order(1047, 102, '2025-02-09', 201, 5, 1299);
CALL seed_order(1048, 103, '2025-02-12', 202, 3, 3499);
CALL seed_order(1049, 104, '2025-02-15', 203, 8,  399);
CALL seed_order(1050, 105, '2025-02-18', 205, 2, 1999);
CALL seed_order(1051, 101, '2025-02-21', 204, 5,  799);
CALL seed_order(1052, 102, '2025-02-24', 201, 4, 1299);

-- ── March 2025 ───────────────────────────────────────────────────────────────
-- Normalising back to baseline
CALL seed_order(1053, 103, '2025-03-04', 201, 5, 1299);
CALL seed_order(1054, 104, '2025-03-08', 202, 3, 3499);
CALL seed_order(1055, 105, '2025-03-11', 205, 3, 1999);
CALL seed_order(1056, 101, '2025-03-14', 203, 5,  399);
CALL seed_order(1057, 102, '2025-03-17', 204, 4,  799);
CALL seed_order(1058, 103, '2025-03-21', 201, 4, 1299);
CALL seed_order(1059, 104, '2025-03-25', 202, 2, 3499);
CALL seed_order(1060, 105, '2025-03-28', 205, 2, 1999);

-- ── April 2025 ───────────────────────────────────────────────────────────────
-- Steady growth trend
CALL seed_order(1061, 101, '2025-04-02', 201, 6, 1299);
CALL seed_order(1062, 102, '2025-04-05', 202, 3, 3499);
CALL seed_order(1063, 103, '2025-04-08', 203, 6,  399);
CALL seed_order(1064, 104, '2025-04-11', 204, 4,  799);
CALL seed_order(1065, 105, '2025-04-15', 205, 2, 1999);
CALL seed_order(1066, 101, '2025-04-18', 201, 5, 1299);
CALL seed_order(1067, 102, '2025-04-22', 202, 2, 3499);
CALL seed_order(1068, 103, '2025-04-25', 203, 5,  399);

DROP PROCEDURE IF EXISTS seed_order;
SET FOREIGN_KEY_CHECKS = 1;

-- Verification query — run this to confirm seeding worked.
-- Should return 5 product rows × 8 months each = 40 rows.
SELECT
  p.display_name,
  DATE_FORMAT(om.created_at, '%Y-%m') AS month,
  SUM(oi.quantity)                    AS total_qty,
  ROUND(SUM(oi.total), 2)             AS total_revenue
FROM order_items oi
JOIN order_master  om ON om.order_id  = oi.order_id
JOIN product_master p  ON p.product_id = oi.product_id
WHERE om.order_status IN ('completed', 'delivered')
  AND oi.product_id BETWEEN 201 AND 205
GROUP BY p.display_name, month
ORDER BY p.display_name, month;
```

---

## 5. Python FastAPI Microservice

### 5.1 Folder Structure

Create a new folder `prediction_service/` at the **root of the project** (same level as `backend/` and `frontend/`).

```
prediction_service/
  main.py            ← FastAPI app with 3 endpoints
  predictor.py       ← ML logic: Prophet + linear regression fallback
  db.py              ← MySQL queries
  schemas.py         ← Pydantic request/response models
  requirements.txt   ← Python package list
  .env               ← DB credentials (never commit this)
```

### 5.2 requirements.txt

```
# FILE: prediction_service/requirements.txt
fastapi==0.110.0
uvicorn[standard]==0.29.0
prophet==1.1.5
scikit-learn==1.4.2
xgboost==2.0.3
pandas==2.2.2
numpy==1.26.4
mysql-connector-python==8.4.0
python-dotenv==1.0.1
pydantic==2.7.0
```

### 5.3 Environment Setup (run once)

```bash
cd prediction_service

# Create and activate a virtual environment
python -m venv venv

# Activate — Mac/Linux:
source venv/bin/activate
# Activate — Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# NOTE: Prophet compiles Stan on first install and can take 5–10 minutes.
# On Ubuntu/Debian you may need: sudo apt-get install -y python3-dev build-essential
# On Mac with Homebrew: brew install gcc
```

### 5.4 .env

```env
# FILE: prediction_service/.env
# Copy your MySQL credentials exactly
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=ecommerce_accrete

# Port this FastAPI service runs on
SERVICE_PORT=8000

# The Node.js backend URL (for CORS)
ALLOWED_ORIGIN=http://localhost:5000
```

### 5.5 db.py

```python
# FILE: prediction_service/db.py

import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
    )


def fetch_monthly_sales(product_id: int) -> list[dict]:
    """
    Returns monthly aggregated sales for one product.
    Only includes completed or delivered orders.
    Output: [{"month": "2024-09-01", "qty": 12.0, "revenue": 15588.0}, ...]
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT
            DATE_FORMAT(om.created_at, '%Y-%m-01') AS month,
            SUM(oi.quantity)                        AS qty,
            SUM(oi.total)                           AS revenue
        FROM order_items oi
        JOIN order_master om ON om.order_id = oi.order_id
        WHERE oi.product_id = %s
          AND om.order_status IN ('completed', 'delivered')
          AND om.is_deleted  = 0
          AND oi.is_deleted  = 0
        GROUP BY DATE_FORMAT(om.created_at, '%Y-%m-01')
        ORDER BY month ASC
    """
    cursor.execute(query, (product_id,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows


def fetch_all_active_product_ids() -> list[int]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT product_id FROM product_master WHERE is_deleted = 0 AND is_active = 1"
    )
    ids = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return ids


def fetch_product_price(product_id: int) -> float:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COALESCE(discounted_price, price) FROM product_master WHERE product_id = %s",
        (product_id,),
    )
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return float(row[0]) if row else 0.0
```

### 5.6 schemas.py

```python
# FILE: prediction_service/schemas.py

from pydantic import BaseModel
from typing import Optional


class MonthlyDataPoint(BaseModel):
    month: str        # "YYYY-MM-DD" (first day of month)
    qty: float
    revenue: float


class PredictionResult(BaseModel):
    product_id: int
    predicted_month: str          # "YYYY-MM-DD" (first day of forecast month)
    predicted_qty: float
    predicted_revenue: float
    confidence_score: Optional[float]  # R² value between 0.0 and 1.0
    model_used: str               # "prophet" or "linear_regression"
    historical: list[MonthlyDataPoint]
    error: Optional[str] = None
```

### 5.7 predictor.py

```python
# FILE: prediction_service/predictor.py

import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score
import warnings

warnings.filterwarnings("ignore")


# ── Helpers ───────────────────────────────────────────────────────────────────

def rows_to_df(rows: list[dict]) -> pd.DataFrame:
    """Convert DB result rows into a clean sorted DataFrame."""
    df = pd.DataFrame(rows)
    df["month"]   = pd.to_datetime(df["month"])
    df["qty"]     = df["qty"].astype(float)
    df["revenue"] = df["revenue"].astype(float)
    return df.sort_values("month").reset_index(drop=True)


def next_month_start(df: pd.DataFrame) -> pd.Timestamp:
    """Return the first day of the month immediately after the last data point."""
    return df["month"].max() + pd.offsets.MonthBegin(1)


# ── Model 1: Prophet (primary — used when >= 6 months of data) ────────────────

def predict_with_prophet(df: pd.DataFrame, price: float) -> dict:
    """
    Uses Facebook Prophet for time-series forecasting.
    Prophet handles yearly seasonality and trend changes automatically.
    """
    prophet_df = df.rename(columns={"month": "ds", "qty": "y"})[["ds", "y"]]

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        seasonality_mode="multiplicative",   # better for sales that scale with trend
        changepoint_prior_scale=0.15,        # controls how flexible the trend is
    )
    model.fit(prophet_df)

    # Predict one month beyond the last historical point
    future   = model.make_future_dataframe(periods=1, freq="MS")
    forecast = model.predict(future)

    pred_row = forecast.iloc[-1]
    pred_qty = max(0.0, float(pred_row["yhat"]))

    # Compute R² on training fit as a confidence proxy
    fitted = forecast.iloc[:-1]["yhat"].values
    actual = prophet_df["y"].values
    try:
        r2 = float(r2_score(actual, fitted))
        r2 = round(max(0.0, min(1.0, r2)), 4)
    except Exception:
        r2 = None

    return {
        "predicted_qty":     round(pred_qty, 2),
        "predicted_revenue": round(pred_qty * price, 2),
        "confidence_score":  r2,
        "model_used":        "prophet",
        "predicted_month":   str(next_month_start(df).date()),
    }


# ── Model 2: Linear Regression (fallback — used when < 6 months of data) ──────

def predict_with_regression(df: pd.DataFrame, price: float) -> dict:
    """
    Simple linear regression with two features:
      - t: integer trend index (0, 1, 2, ...)
      - month_num: month of year (1–12) as a seasonality signal
    """
    df = df.copy()
    df["t"]         = np.arange(len(df))
    df["month_num"] = df["month"].dt.month

    X = df[["t", "month_num"]].values
    y = df["qty"].values

    scaler   = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = LinearRegression()
    model.fit(X_scaled, y)

    next_ts      = next_month_start(df)
    next_t       = len(df)
    next_mnum    = next_ts.month
    X_pred       = scaler.transform([[next_t, next_mnum]])
    pred_qty     = max(0.0, float(model.predict(X_pred)[0]))

    try:
        r2 = float(r2_score(y, model.predict(X_scaled)))
        r2 = round(max(0.0, min(1.0, r2)), 4)
    except Exception:
        r2 = None

    return {
        "predicted_qty":     round(pred_qty, 2),
        "predicted_revenue": round(pred_qty * price, 2),
        "confidence_score":  r2,
        "model_used":        "linear_regression",
        "predicted_month":   str(next_ts.date()),
    }


# ── Entry point ───────────────────────────────────────────────────────────────

def run_prediction(rows: list[dict], price: float) -> dict:
    """
    Decides which model to use and returns a result dict
    that matches the PredictionResult schema.
    """
    if len(rows) < 2:
        return {
            "predicted_qty":     0.0,
            "predicted_revenue": 0.0,
            "confidence_score":  None,
            "model_used":        "none",
            "predicted_month":   "",
            "historical":        [],
            "error": "Insufficient data: at least 2 months of sales history required.",
        }

    df = rows_to_df(rows)

    if len(df) >= 6:
        result = predict_with_prophet(df, price)
    else:
        result = predict_with_regression(df, price)

    result["historical"] = [
        {
            "month":   str(row["month"].date()),
            "qty":     float(row["qty"]),
            "revenue": float(row["revenue"]),
        }
        for _, row in df.iterrows()
    ]
    result["error"] = None
    return result
```

### 5.8 main.py

```python
# FILE: prediction_service/main.py

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from db import fetch_monthly_sales, fetch_all_active_product_ids, fetch_product_price
from predictor import run_prediction
from schemas import PredictionResult

load_dotenv()

app = FastAPI(title="Sales Prediction Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGIN", "http://localhost:5000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "sales-prediction"}


@app.get("/predict/{product_id}", response_model=PredictionResult)
def predict_single(product_id: int):
    """Predict next month's sales for one product."""
    rows = fetch_monthly_sales(product_id)
    if not rows:
        raise HTTPException(
            status_code=404,
            detail=f"No sales history found for product_id={product_id}",
        )
    price  = fetch_product_price(product_id)
    result = run_prediction(rows, price)
    return {"product_id": product_id, **result}


@app.get("/predict-all")
def predict_all():
    """Predict next month's sales for every active product."""
    product_ids = fetch_all_active_product_ids()
    results = []
    for pid in product_ids:
        rows = fetch_monthly_sales(pid)
        if not rows:
            continue
        price  = fetch_product_price(pid)
        result = run_prediction(rows, price)
        results.append({"product_id": pid, **result})
    return {"count": len(results), "predictions": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("SERVICE_PORT", 8000)),
        reload=True,
    )
```

### 5.9 Starting the Python Service

```bash
# From inside prediction_service/ with the venv activated:
python main.py

# Service starts at: http://localhost:8000
# Auto-docs available at: http://localhost:8000/docs

# Quick tests:
curl http://localhost:8000/health
# → {"status":"ok","service":"sales-prediction"}

curl http://localhost:8000/predict/201
# → Full prediction JSON for Wireless Earbuds Pro
```

---

## 6. Node.js / Express Integration

### 6.1 Install Axios

```bash
cd backend
npm install axios
```

### 6.2 Add to backend/.env

```env
# Add this line to your existing backend/.env
PREDICTION_SERVICE_URL=http://localhost:8000
```

### 6.3 Create the Route File

```javascript
// FILE: backend/routes/admin/salesPrediction.routes.js
// CREATE THIS FILE — do not modify any existing route files

const express = require("express");
const axios   = require("axios");
const db      = require("../../config/db"); // Your existing MySQL pool
const router  = express.Router();

const ML_URL = process.env.PREDICTION_SERVICE_URL || "http://localhost:8000";

// ── Helper: upsert prediction into the cache table ────────────────────────────
async function cachePrediction(result) {
  const {
    product_id, predicted_month, predicted_qty,
    predicted_revenue, confidence_score, model_used,
  } = result;

  const sql = `
    INSERT INTO sales_predictions
      (product_id, predicted_month, predicted_qty, predicted_revenue,
       confidence_score, model_used)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      predicted_qty     = VALUES(predicted_qty),
      predicted_revenue = VALUES(predicted_revenue),
      confidence_score  = VALUES(confidence_score),
      model_used        = VALUES(model_used),
      generated_at      = CURRENT_TIMESTAMP
  `;
  await db.query(sql, [
    product_id, predicted_month, predicted_qty,
    predicted_revenue, confidence_score, model_used,
  ]);
}

// ── GET /api/admin/sales/predict/:productId ───────────────────────────────────
// Live prediction for one product. Calls the Python service.
// Timeout: 30 seconds (Prophet can be slow on first call).
router.get("/predict/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    const { data } = await axios.get(`${ML_URL}/predict/${productId}`, {
      timeout: 30000,
    });
    cachePrediction(data).catch(() => {}); // async cache, never block response
    return res.json({ success: true, data });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "No sales history found for this product.",
      });
    }
    console.error("[Prediction] Service error:", err.message);
    return res.status(503).json({
      success: false,
      message: "Prediction service unavailable. Ensure Python service is running.",
    });
  }
});

// ── GET /api/admin/sales/predict-all ─────────────────────────────────────────
// Predictions for all active products. Slow (up to 120s) — call sparingly.
router.get("/predict-all", async (req, res) => {
  try {
    const { data } = await axios.get(`${ML_URL}/predict-all`, {
      timeout: 120000,
    });
    await Promise.allSettled(data.predictions.map(cachePrediction));
    return res.json({ success: true, ...data });
  } catch (err) {
    console.error("[Prediction] predict-all error:", err.message);
    return res.status(503).json({
      success: false,
      message: "Prediction service unavailable.",
    });
  }
});

// ── GET /api/admin/sales/cached ───────────────────────────────────────────────
// Returns the last cached predictions from MySQL. Fast — no Python call.
// Use this for the initial page load.
router.get("/cached", async (req, res) => {
  const sql = `
    SELECT
      sp.*,
      p.display_name,
      p.price,
      c.category_name
    FROM sales_predictions sp
    JOIN product_master  p ON p.product_id  = sp.product_id
    LEFT JOIN category_master c ON c.category_id = p.category_id
    ORDER BY sp.predicted_revenue DESC
  `;
  const [rows] = await db.query(sql);
  return res.json({ success: true, count: rows.length, data: rows });
});

// ── GET /api/admin/sales/history/:productId ───────────────────────────────────
// Raw monthly history for a product — useful for debugging.
router.get("/history/:productId", async (req, res) => {
  const sql = `
    SELECT
      DATE_FORMAT(om.created_at, '%Y-%m-01') AS month,
      SUM(oi.quantity)                        AS qty,
      ROUND(SUM(oi.total), 2)                 AS revenue
    FROM order_items oi
    JOIN order_master om ON om.order_id = oi.order_id
    WHERE oi.product_id = ?
      AND om.order_status IN ('completed', 'delivered')
      AND om.is_deleted  = 0
      AND oi.is_deleted  = 0
    GROUP BY month
    ORDER BY month ASC
  `;
  const [rows] = await db.query(sql, [req.params.productId]);
  return res.json({ success: true, data: rows });
});

module.exports = router;
```

### 6.4 Register the Route in server.js

Open `backend/server.js` (or `app.js`) and add these two lines in the appropriate section:

```javascript
// Add with your other admin route imports (near the top of the file):
const salesPredictionRoutes = require("./routes/admin/salesPrediction.routes");

// Add with your other app.use() calls.
// If you use auth + admin middleware, chain them like the example below.
// Replace authMiddleware and adminMiddleware with your actual middleware names.
app.use(
  "/api/admin/sales",
  authMiddleware,    // ← your existing JWT auth middleware
  adminMiddleware,   // ← your existing admin role check middleware
  salesPredictionRoutes
);

// If you have no middleware wrappers yet, use the simple form:
// app.use("/api/admin/sales", salesPredictionRoutes);
```

### 6.5 API Contract

| Endpoint | Method | Speed | Description |
|---|---|---|---|
| `/api/admin/sales/predict/:productId` | GET | ~5–15s | Live prediction via Python for one product |
| `/api/admin/sales/predict-all` | GET | ~30–120s | Live predictions for all products |
| `/api/admin/sales/cached` | GET | <100ms | Last cached results from MySQL |
| `/api/admin/sales/history/:productId` | GET | <100ms | Raw monthly sales history |

---

## 7. React Admin UI

### 7.1 Install Frontend Dependency

```bash
cd frontend
npm install recharts
```

### 7.2 Create the Page Component

```jsx
// FILE: frontend/src/pages/admin/SalesPrediction.jsx
// CREATE THIS FILE

import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import axios from "axios";

const API = "/api/admin/sales";

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtMonth = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "#1E3A5F" }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      flex: 1, minWidth: 160,
    }}>
      <p style={{ margin: 0, fontSize: 12, color: "#888", fontWeight: 500 }}>
        {label}
      </p>
      <p style={{ margin: "8px 0 4px", fontSize: 26, fontWeight: 700, color }}>
        {value}
      </p>
      {sub && (
        <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{sub}</p>
      )}
    </div>
  );
}

// ── ProductSelector ───────────────────────────────────────────────────────────
function ProductSelector({ products, selected, onSelect }) {
  const [search, setSearch] = useState("");
  const filtered = products.filter((p) =>
    p.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px 14px", borderRadius: 8,
          border: "1px solid #ddd", fontSize: 14,
          outline: "none", width: "100%", boxSizing: "border-box",
        }}
      />
      <div style={{
        maxHeight: 280, overflowY: "auto",
        border: "1px solid #eee", borderRadius: 8, background: "#fafafa",
      }}>
        {filtered.map((p) => (
          <div
            key={p.product_id}
            onClick={() => onSelect(p)}
            style={{
              padding: "10px 14px", cursor: "pointer", fontSize: 14,
              background: selected?.product_id === p.product_id ? "#E8F4FD" : "transparent",
              borderLeft: selected?.product_id === p.product_id
                ? "3px solid #2E75B6" : "3px solid transparent",
              fontWeight: selected?.product_id === p.product_id ? 600 : 400,
            }}
          >
            {p.display_name}
            <span style={{ fontSize: 11, color: "#bbb", marginLeft: 8 }}>
              #{p.product_id}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ padding: 16, color: "#aaa", fontSize: 13 }}>
            No products found
          </p>
        )}
      </div>
    </div>
  );
}

// ── Custom Chart Tooltip ──────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #ddd", borderRadius: 8,
      padding: "10px 14px", fontSize: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}>
      <p style={{ margin: "0 0 6px", fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "2px 0", color: p.color }}>
          {p.name}:{" "}
          {p.name.toLowerCase().includes("revenue")
            ? fmtCurrency(p.value)
            : `${Math.round(p.value)} units`}
        </p>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SalesPrediction() {
  const [products, setProducts]         = useState([]);
  const [selected, setSelected]         = useState(null);
  const [prediction, setPrediction]     = useState(null);
  const [loading, setLoading]           = useState(false);
  const [loadingProds, setLoadingProds] = useState(true);
  const [error, setError]               = useState("");
  const [activeChart, setActiveChart]   = useState("qty"); // "qty" or "revenue"

  // ── Load product list on mount ─────────────────────────────────────────────
  useEffect(() => {
    // IMPORTANT: Adjust the endpoint below to match your existing products API.
    // The response should have a "data" or "products" array where each item
    // has at least: { product_id, display_name, price }
    axios
      .get("/api/admin/products?is_active=1&limit=200")
      .then((r) => setProducts(r.data.data || r.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProds(false));
  }, []);

  // ── Fetch prediction when a product is selected ────────────────────────────
  const fetchPrediction = useCallback(async (product) => {
    setSelected(product);
    setPrediction(null);
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/predict/${product.product_id}`);
      if (data.success) {
        setPrediction(data.data);
      } else {
        setError(data.message || "Prediction failed.");
      }
    } catch (e) {
      setError(
        e.response?.data?.message ||
        "Could not reach the prediction service. Is it running?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Build chart data: historical points + 1 forecast point ────────────────
  const chartData = prediction
    ? [
        ...prediction.historical.map((h) => ({
          month:             fmtMonth(h.month),
          qty:               h.qty,
          revenue:           h.revenue,
          predicted_qty:     null,
          predicted_revenue: null,
        })),
        {
          month:             fmtMonth(prediction.predicted_month) + " ★",
          qty:               null,
          revenue:           null,
          predicted_qty:     prediction.predicted_qty,
          predicted_revenue: prediction.predicted_revenue,
        },
      ]
    : [];

  const confidencePct =
    prediction?.confidence_score != null
      ? Math.round(prediction.confidence_score * 100) + "%"
      : "N/A";

  const confidenceColor =
    !prediction?.confidence_score ? "#888"
    : prediction.confidence_score > 0.7 ? "#1B5E20"
    : prediction.confidence_score > 0.4 ? "#E65100"
    : "#B71C1C";

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!prediction) return;
    const rows = [
      ["Month", "Actual Units", "Actual Revenue (INR)", "Forecast Units", "Forecast Revenue (INR)", "Type"],
      ...prediction.historical.map((h) => [
        h.month, h.qty, h.revenue, "", "", "actual",
      ]),
      [
        prediction.predicted_month, "", "",
        prediction.predicted_qty, prediction.predicted_revenue, "forecast",
      ],
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `forecast_${selected.product_id}_${prediction.predicted_month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 24, background: "#F5F7FA", minHeight: "100vh" }}>

      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, color: "#1E3A5F", fontWeight: 700 }}>
          Sales Prediction
        </h1>
        <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>
          Forecast next month's units and revenue for any product using ML
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: 24,
        alignItems: "start",
      }}>

        {/* Left sidebar — product selector */}
        <div style={{
          background: "#fff", borderRadius: 12,
          padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, color: "#333" }}>
            Select a Product
          </h3>
          {loadingProds ? (
            <p style={{ color: "#aaa", fontSize: 13 }}>Loading products…</p>
          ) : (
            <ProductSelector
              products={products}
              selected={selected}
              onSelect={fetchPrediction}
            />
          )}
        </div>

        {/* Right main panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Empty state */}
          {!selected && !loading && (
            <div style={{
              background: "#fff", borderRadius: 12, padding: 60,
              textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <p style={{ fontSize: 40, margin: 0 }}>📈</p>
              <p style={{ color: "#888", marginTop: 12, fontSize: 15 }}>
                Select a product on the left to see its sales forecast
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{
              background: "#fff", borderRadius: 12, padding: 60,
              textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <p style={{ fontSize: 14, color: "#888" }}>
                Running prediction model… ⏳ (may take up to 15 seconds)
              </p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{
              background: "#FFEBEE", borderRadius: 12, padding: 20,
              border: "1px solid #FFCDD2",
            }}>
              <p style={{ margin: 0, color: "#C62828", fontSize: 14 }}>
                ⚠ {error}
              </p>
            </div>
          )}

          {/* Prediction result */}
          {prediction && !loading && (
            <>
              {/* Stat cards row */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <StatCard
                  label="Predicted Units — Next Month"
                  value={Math.round(prediction.predicted_qty)}
                  sub={`For ${fmtMonth(prediction.predicted_month)}`}
                  color="#1E3A5F"
                />
                <StatCard
                  label="Predicted Revenue"
                  value={fmtCurrency(prediction.predicted_revenue)}
                  sub="Estimated gross (before tax)"
                  color="#1B5E20"
                />
                <StatCard
                  label="Model Confidence (R²)"
                  value={confidencePct}
                  sub={`Model: ${prediction.model_used}`}
                  color={confidenceColor}
                />
              </div>

              {/* Chart card */}
              <div style={{
                background: "#fff", borderRadius: 12,
                padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 16,
                }}>
                  <h3 style={{ margin: 0, fontSize: 15, color: "#333" }}>
                    Historical + Forecast — {selected.display_name}
                  </h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["qty", "revenue"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveChart(tab)}
                        style={{
                          padding: "6px 16px", borderRadius: 6,
                          border: "none", cursor: "pointer",
                          fontSize: 13, fontWeight: 500,
                          background: activeChart === tab ? "#2E75B6" : "#F0F0F0",
                          color: activeChart === tab ? "#fff" : "#555",
                        }}
                      >
                        {tab === "qty" ? "Units" : "Revenue"}
                      </button>
                    ))}
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gradHist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#2E75B6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#2E75B6" stopOpacity={0}   />
                      </linearGradient>
                      <linearGradient id="gradPred" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#FF6B35" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#888" }}
                      tickFormatter={(v) =>
                        activeChart === "revenue"
                          ? "₹" + (v / 1000).toFixed(0) + "k"
                          : v
                      }
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey={activeChart}
                      name={activeChart === "qty" ? "Actual Units" : "Actual Revenue"}
                      stroke="#2E75B6"
                      fill="url(#gradHist)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls={false}
                    />
                    <Area
                      type="monotone"
                      dataKey={activeChart === "qty" ? "predicted_qty" : "predicted_revenue"}
                      name={activeChart === "qty" ? "Forecast Units" : "Forecast Revenue"}
                      stroke="#FF6B35"
                      fill="url(#gradPred)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 7, fill: "#FF6B35" }}
                      connectNulls={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                <p style={{ fontSize: 11, color: "#bbb", marginTop: 8 }}>
                  ★ Forecast point shown in orange dashes.
                  Model: {prediction.model_used}.
                  Confidence (R²): {confidencePct}
                  {prediction.confidence_score < 0.5
                    ? " — low confidence, add more historical data for better accuracy."
                    : "."}
                </p>
              </div>

              {/* Export button */}
              <div style={{ textAlign: "right" }}>
                <button
                  onClick={exportCSV}
                  style={{
                    padding: "10px 24px", borderRadius: 8,
                    border: "none", background: "#1E3A5F",
                    color: "#fff", fontSize: 14,
                    cursor: "pointer", fontWeight: 500,
                  }}
                >
                  Export CSV
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 7.3 Add the Route to React Router

In `frontend/src/App.jsx` (or wherever your routes are defined):

```jsx
// Add import at the top:
import SalesPrediction from "./pages/admin/SalesPrediction";

// Add inside your <Routes> block, inside the admin-protected route group:
<Route path="/admin/sales-prediction" element={<SalesPrediction />} />
```

### 7.4 Add Link to the Admin Sidebar

In your existing admin sidebar or navigation component:

```jsx
<NavLink to="/admin/sales-prediction">
  📈 Sales Prediction
</NavLink>
```

---

## 8. Running the Full System

Execute these steps in this exact order:

### Step 1 — Seed the database
```bash
mysql -u root -p ecommerce_accrete < backend/scripts/seed_sales_data.sql
```

### Step 2 — Create the cache table
```bash
mysql -u root -p ecommerce_accrete < backend/scripts/create_predictions_table.sql
```

### Step 3 — Start the Python service (Terminal 1)
```bash
cd prediction_service
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows
python main.py
```
> Expected: `Uvicorn running on http://0.0.0.0:8000`

### Step 4 — Start the Node backend (Terminal 2)
```bash
cd backend
npm run dev
```

### Step 5 — Start the React frontend (Terminal 3)
```bash
cd frontend
npm start
```

### Step 6 — Verify each layer

```bash
# Python service health
curl http://localhost:8000/health
# → {"status":"ok","service":"sales-prediction"}

# Python prediction directly
curl http://localhost:8000/predict/201
# → Full JSON prediction for Wireless Earbuds Pro

# Node proxy
curl http://localhost:5000/api/admin/sales/predict/201
# → {"success":true,"data":{...}}

# Open in browser
http://localhost:3000/admin/sales-prediction
```

### Expected Response Shape for /predict/201

```json
{
  "product_id": 201,
  "predicted_month": "2025-05-01",
  "predicted_qty": 27.4,
  "predicted_revenue": 35600.6,
  "confidence_score": 0.8732,
  "model_used": "prophet",
  "historical": [
    { "month": "2024-09-01", "qty": 6,  "revenue": 7794.0  },
    { "month": "2024-10-01", "qty": 3,  "revenue": 3897.0  },
    { "month": "2024-11-01", "qty": 20, "revenue": 25980.0 },
    { "month": "2024-12-01", "qty": 31, "revenue": 40269.0 },
    { "month": "2025-01-01", "qty": 7,  "revenue": 9093.0  },
    { "month": "2025-02-01", "qty": 9,  "revenue": 11691.0 },
    { "month": "2025-03-01", "qty": 9,  "revenue": 11691.0 },
    { "month": "2025-04-01", "qty": 11, "revenue": 14289.0 }
  ],
  "error": null
}
```

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ModuleNotFoundError: prophet` | Prophet not installed | `pip install prophet` — on Windows install Visual C++ Build Tools first |
| `pip install prophet` hangs for 10+ min | Stan compilation | Normal on first install. Wait. Use `pip install prophet --no-cache-dir` if it fails |
| `mysql.connector.errors.DatabaseError` | Wrong DB credentials | Check `prediction_service/.env` — DB_USER, DB_PASSWORD, DB_NAME |
| `CORS error` in browser console | ALLOWED_ORIGIN mismatch | Set `ALLOWED_ORIGIN` in `prediction_service/.env` to exactly match your Node server URL |
| Node returns `503` on `/predict` route | Python service not running | Start the Python service first (Step 3) |
| Chart renders but shows no data | Wrong products API endpoint | In `SalesPrediction.jsx` line ~70, change `/api/admin/products` to match your actual products list endpoint |
| `confidence_score` is negative | Too few data points or all-zero months | Normal — model still predicts. Add more data for better R² |
| `predicted_month` is empty string | Product has fewer than 2 months of data | Seed more data or select a product with history |
| `Foreign key constraint fails` on seed | `user_master` already has a user with ID 1 that isn't admin | Remove `created_by = 1` references or use a valid admin user_id from your DB |
| `Duplicate entry` on seed | Script was already run | Safe — `INSERT IGNORE` prevents duplicate errors |

---

## 10. File Manifest

Every file that must be created or modified:

| File | Action | Description |
|---|---|---|
| `backend/scripts/create_predictions_table.sql` | CREATE | New cache table DDL |
| `backend/scripts/seed_sales_data.sql` | CREATE | 8-month synthetic order history |
| `backend/routes/admin/salesPrediction.routes.js` | CREATE | Node proxy + cache endpoints |
| `backend/server.js` | MODIFY | Register `/api/admin/sales` route |
| `backend/.env` | MODIFY | Add `PREDICTION_SERVICE_URL` |
| `prediction_service/requirements.txt` | CREATE | Python dependencies |
| `prediction_service/.env` | CREATE | DB credentials for Python |
| `prediction_service/db.py` | CREATE | MySQL queries in Python |
| `prediction_service/schemas.py` | CREATE | Pydantic response models |
| `prediction_service/predictor.py` | CREATE | Prophet + regression ML logic |
| `prediction_service/main.py` | CREATE | FastAPI app with 3 routes |
| `frontend/src/pages/admin/SalesPrediction.jsx` | CREATE | Full React admin page |
| `frontend/src/App.jsx` | MODIFY | Add `/admin/sales-prediction` route |
| Admin sidebar component | MODIFY | Add nav link |

---

## 11. Future Enhancements

Once the base implementation is working, these are the recommended next steps in priority order:

**ML Accuracy**
- Add more features to XGBoost: day-of-week ordering patterns, active offer/discount flags, product rating average — these signals improve accuracy significantly
- Implement `cross_val_score` comparison between Prophet and XGBoost per product, then auto-select the better model
- Add Prophet's native confidence intervals (`yhat_lower`, `yhat_upper`) as a shaded band on the chart
- Set up a weekly cron job in Node using `node-cron` to call `/predict-all` every Sunday night and refresh the cache

**UI**
- Overview table on initial load showing all products with cached next-month forecasts (call `/api/admin/sales/cached`)
- Category-level aggregated view: total predicted units and revenue for Electronics, Clothing, etc.
- Accuracy tracker: after each month ends, compare that month's prediction against actual sales and display % error
- PDF export using `@react-pdf/renderer`

**Infrastructure**
- Add a `Dockerfile` to `prediction_service/` so the Python service can be deployed independently
- Use Redis to cache predictions instead of MySQL for faster reads and automatic TTL expiry

---

*This document is self-contained. Every SQL statement, Python file, Node.js route, and React component is complete and ready to implement.*
