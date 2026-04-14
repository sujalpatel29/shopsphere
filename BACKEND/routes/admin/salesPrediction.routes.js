import express from "express";
import pool from "../../configs/db.js";
import {
  badRequest,
  notFound,
  ok,
  serverError,
} from "../../utils/apiResponse.js";

const router = express.Router();

const ML_URL = (process.env.PREDICTION_SERVICE_URL || "http://localhost:8000").replace(
  /\/+$/,
  "",
);

function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

async function callPredictionService(path, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${ML_URL}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    let body = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    if (!response.ok) {
      const message =
        (typeof body === "object" && (body.detail || body.message)) ||
        (typeof body === "string" && body) ||
        "Prediction service error";
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return body;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("Prediction service timed out");
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function cachePrediction(prediction) {
  const {
    product_id: productId,
    predicted_month: predictedMonth,
    predicted_qty: predictedQty,
    predicted_revenue: predictedRevenue,
    confidence_score: confidenceScore,
    model_used: modelUsed,
  } = prediction;

  if (!productId || !predictedMonth) {
    return;
  }

  await pool.execute(
    `
    INSERT INTO sales_predictions
      (
        product_id,
        predicted_month,
        predicted_qty,
        predicted_revenue,
        confidence_score,
        model_used
      )
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      predicted_qty = VALUES(predicted_qty),
      predicted_revenue = VALUES(predicted_revenue),
      confidence_score = VALUES(confidence_score),
      model_used = VALUES(model_used),
      generated_at = CURRENT_TIMESTAMP
    `,
    [
      productId,
      predictedMonth,
      Number(predictedQty || 0),
      Number(predictedRevenue || 0),
      confidenceScore ?? null,
      modelUsed || "unknown",
    ],
  );
}

router.get("/predict/:productId", async (req, res) => {
  const productId = parsePositiveInt(req.params.productId);
  if (!productId) {
    return badRequest(res, "A valid productId is required.");
  }

  try {
    const prediction = await callPredictionService(`/predict/${productId}`, 30000);
    try {
      await cachePrediction(prediction);
    } catch (cacheError) {
      console.warn(
        `[Sales Prediction] cache upsert failed for product ${productId}:`,
        cacheError.message,
      );
    }
    return ok(res, "Prediction fetched successfully", prediction);
  } catch (error) {
    if (error.status === 404) {
      return notFound(res, error.message || "Product not found.");
    }

    if (error.status === 400 || error.status === 422) {
      return badRequest(res, error.message || "Invalid prediction request.");
    }

    if (error.status === 504) {
      return res.status(504).json({
        success: false,
        message:
          "Prediction timed out. Try again or verify the prediction service is healthy.",
      });
    }

    console.error("[Sales Prediction] /predict error:", error.message);
    return res.status(503).json({
      success: false,
      message: "Prediction service unavailable. Ensure the Python service is running.",
    });
  }
});

router.get("/predict-all", async (req, res) => {
  try {
    const payload = await callPredictionService("/predict-all", 120000);
    const predictions = Array.isArray(payload?.predictions)
      ? payload.predictions
      : [];

    const results = await Promise.allSettled(
      predictions.map((prediction) => cachePrediction(prediction)),
    );

    const cachedCount = results.filter((result) => result.status === "fulfilled").length;

    return ok(res, "Predictions generated successfully", {
      count: Number(payload?.count || predictions.length),
      cached_count: cachedCount,
      predictions,
    });
  } catch (error) {
    if (error.status === 504) {
      return res.status(504).json({
        success: false,
        message: "Bulk prediction timed out. Try again after the service warms up.",
      });
    }

    console.error("[Sales Prediction] /predict-all error:", error.message);
    return res.status(503).json({
      success: false,
      message: "Prediction service unavailable.",
    });
  }
});

router.get("/cached", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT
        sp.prediction_id,
        sp.product_id,
        sp.predicted_month,
        sp.predicted_qty,
        sp.predicted_revenue,
        sp.confidence_score,
        sp.model_used,
        sp.generated_at,
        pm.display_name,
        COALESCE(pm.discounted_price, pm.price) AS effective_price,
        cm.category_name
      FROM sales_predictions sp
      INNER JOIN product_master pm
        ON pm.product_id = sp.product_id
       AND pm.is_deleted = 0
      LEFT JOIN category_master cm
        ON cm.category_id = pm.category_id
       AND cm.is_deleted = 0
      ORDER BY sp.predicted_revenue DESC, sp.generated_at DESC
      `,
    );

    return ok(res, "Cached predictions fetched successfully", {
      count: rows.length,
      items: rows,
    });
  } catch (error) {
    console.error("[Sales Prediction] /cached error:", error.message);
    return serverError(res, "Unable to fetch cached predictions.");
  }
});

router.get("/history/:productId", async (req, res) => {
  const productId = parsePositiveInt(req.params.productId);
  if (!productId) {
    return badRequest(res, "A valid productId is required.");
  }

  try {
    const [rows] = await pool.execute(
      `
      SELECT
        DATE_FORMAT(om.created_at, '%Y-%m-01') AS month,
        ROUND(SUM(oi.quantity), 2) AS qty,
        ROUND(SUM(oi.total), 2) AS revenue
      FROM order_items oi
      INNER JOIN order_master om ON om.order_id = oi.order_id
      WHERE oi.product_id = ?
        AND oi.is_deleted = 0
        AND om.is_deleted = 0
        AND om.order_status IN ('completed', 'delivered')
      GROUP BY DATE_FORMAT(om.created_at, '%Y-%m-01')
      ORDER BY month ASC
      `,
      [productId],
    );

    return ok(res, "Sales history fetched successfully", rows);
  } catch (error) {
    console.error("[Sales Prediction] /history error:", error.message);
    return serverError(res, "Unable to fetch sales history.");
  }
});

export default router;
