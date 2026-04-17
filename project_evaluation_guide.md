# Technical Evaluation Guide: Multi-Vendor E-Commerce Platform with AI Sales Prediction

This document provides a comprehensive technical overview of the e-commerce platform. It is designed to assist in project evaluations, architectural discussions, and panel reviews.

---

## 1. System Architecture & Design

The platform follows a **Service-Oriented Architecture (SOA)**, separating concerns into three distinct layers:
1. **Frontend (Client Layer):** A Single Page Application (SPA) that delivers a dynamic user experience for three distinct roles: Customers, Sellers, and Admins.
2. **Main Backend (API Layer):** A robust monolithic REST API that handles business logic, authentication, order processing, and database transactions.
3. **Prediction Service (Microservice Layer):** A specialized, decoupled machine learning service dedicated solely to forecasting future sales and revenue.

### Why this Architecture?
* **Scalability:** The heavy computational load of machine learning (Prophet/XGBoost/Linear Regression) does not block the Node.js event loop handling concurrent user requests.
* **Separation of Concerns:** Python is the industry standard for Data Science and ML, while Node.js excels at asynchronous I/O and REST APIs. Splitting them leverages the strengths of both ecosystems.

---

## 2. Core Technologies & Frameworks

### Frontend Stack
* **Framework:** React.js bootstrapped with Vite for extremely fast Hot Module Replacement (HMR) and optimized production builds.
* **State Management:** Redux Toolkit (RTK) handles complex global state (e.g., User Authentication, Cart contents) efficiently. Context API is used for simpler UI state (like Theme/Dark Mode).
* **Styling & UI:** Tailwind CSS provides utility-first, responsive styling. PrimeReact is used for complex, accessible UI components.
* **Data Visualization:** Recharts is utilized to render the AI sales predictions into interactive, responsive Area Charts.

### Main Backend Stack
* **Runtime & Framework:** Node.js with Express.js.
* **Database:** MySQL. A relational database is strictly required due to the highly structured nature of e-commerce data (ACID compliance).
* **Authentication:** JSON Web Tokens (JWT) for stateless authentication.
* **Integrations:** Cloudinary for image hosting and Stripe for payments.

### AI Prediction Service Stack
* **Framework:** FastAPI (Python). Extremely fast, asynchronous, and provides automatic interactive API documentation.
* **Machine Learning Libraries:** 
  * **Prophet:** Developed by Meta, excellent for time-series forecasting that exhibits strong seasonal effects.
  * **Scikit-learn:** Utilized for Linear Regression and preprocessing (StandardScaler).
  * **Pandas & NumPy:** For high-performance data manipulation and preprocessing.
  * **Pydantic:** For strict data validation and serialization.

---

## 3. Machine Learning Microservice Deep Dive

The AI Sales Prediction feature is encapsulated within a dedicated Python microservice.

### File Structure & Responsibilities
1. **`main.py`:** The entry point of the FastAPI application. It configures CORS, initializes the server via Uvicorn, and defines the REST endpoints (`/health`, `/predict/{product_id}`, and `/predict-all`). It orchestrates the flow by calling DB functions and passing the data to the predictor.
2. **`db.py`:** Handles all direct interactions with the MySQL database. It contains highly optimized queries to fetch active product IDs, fetch historical monthly sales aggregated from the `order_items` and `order_master` tables, and fetch the current price of a product.
3. **`predictor.py`:** The core mathematical engine. It contains the logic to convert raw database rows into Pandas DataFrames and executes the specific machine learning models (Prophet or Linear Regression) based on data availability. It also calculates the R-squared ($R^2$) confidence score.
4. **`schemas.py`:** Utilizes Pydantic to strictly define the expected output format (`PredictionResult`), ensuring type safety before the JSON payload is sent back to the Node.js server.

### ML Execution Flow
1. **Trigger:** Node.js requests a prediction from FastAPI (`/predict/{product_id}`).
2. **Data Fetching:** FastAPI calls `db.py` to fetch aggregated historical sales data (Quantity and Revenue per Month) for that specific product.
3. **Dynamic Model Selection (`predictor.py`):**
   * **Insufficient Data (0-1 months):** The system gracefully aborts ML execution and returns $0$, preventing mathematical errors, and flags `model_used` as `insufficient_data`.
   * **Low Data (2-5 months):** Prophet requires substantial data to detect seasonality. For sparse datasets, the system intelligently defaults to a **Linear Regression** model (`sklearn.linear_model.LinearRegression`). It standardizes the data using `StandardScaler` to predict the upward or downward trend.
   * **Rich Data (6+ months):** The system utilizes **Meta's Prophet**, configured with `yearly_seasonality=True` and `multiplicative` seasonality. Prophet fits the data and predicts the next month's quantity (`yhat`).
   * **Fallback:** If Prophet encounters a runtime exception (e.g., convergence failure), the system implements a `try-except` block to fall back to `linear_regression_fallback`.
4. **Response:** The predicted quantity is multiplied by the current price to estimate revenue. An $R^2$ (R-squared) confidence score is calculated to tell the user how reliable the model is. The payload is validated by Pydantic and returned.

---

## 4. Potential Panel Questions & Recommended Answers

### Q1: Why did you choose a Relational Database (MySQL) over NoSQL (MongoDB) for an E-commerce platform?
**Answer:** E-commerce data is inherently relational. An order belongs to a user, contains multiple order items, which link to products, which belong to sellers. MySQL enforces ACID properties (Atomicity, Consistency, Isolation, Durability), ensuring financial and inventory data integrity.

### Q2: Why is the Machine Learning model running in a separate Python service instead of directly in Node.js?
**Answer:** Node.js is single-threaded. Running complex mathematical algorithms like Prophet or Matrix Inversions for Linear Regression would block the event loop, causing the entire API to freeze for all users. By isolating it in a Python FastAPI service, Node.js can await the HTTP response asynchronously. Furthermore, Python has the most robust ecosystem for Data Science (Pandas, Prophet, Scikit-learn).

### Q3: Why use FastAPI over Flask or Django for the ML service?
**Answer:** FastAPI is built on ASGI (Asynchronous Server Gateway Interface), making it incredibly fast—on par with NodeJS and Go. It also heavily utilizes Python type hints to auto-generate Pydantic schemas and interactive Swagger UI documentation out of the box, which drastically speeds up integration with the Node.js backend.

### Q4: How do you handle predictions for newly added products with very little sales history?
**Answer:** We implemented dynamic model selection in `predictor.py`. If a product has less than 2 months of history, the system explicitly returns `insufficient_data` instead of throwing an error. If it has between 2 and 5 months, we use a simple `Linear Regression` model because complex time-series models like Prophet will overfit or fail on small datasets. Once 6 or more months of data are collected, the system automatically upgrades to using `Prophet` to capture seasonality.

### Q5: What is Meta's Prophet and why did you choose it over basic ARIMA models?
**Answer:** Prophet is a forecasting procedure implemented in R and Python. It is exceptionally good at handling time-series data that has strong seasonal effects and historical trend changes. Unlike ARIMA, which requires data to be stationary and involves complex manual hyperparameter tuning (differencing, auto-regressive terms), Prophet is robust to missing data, handles outliers well, and automatically detects yearly, weekly, and daily seasonality.

### Q6: How do you handle performance when the prediction models take a long time to run?
**Answer:** We implemented a caching layer in the Main Backend. When a prediction is generated by FastAPI, the Node.js server performs an `UPSERT` into a `sales_predictions` database table. Subsequent requests for the dashboard default to fetching the `cached` data instantly. The ML model is only explicitly re-triggered via a "Refresh" or specific product prediction call.

### Q7: How does the system calculate the "Confidence Score" shown on the UI?
**Answer:** The confidence score is the **R-squared ($R^2$) metric**, calculated using `scikit-learn`'s `r2_score` function. It measures the proportion of the variance in the dependent variable (Quantity Sold) that is predictable from the independent variable (Time). It is clamped between 0 and 1, and converted to a percentage on the frontend. A higher percentage indicates the model's fitted curve closely matches the actual historical data points.