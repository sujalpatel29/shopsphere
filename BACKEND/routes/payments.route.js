import express from "express";
import PaymentController from "../controllers/payments.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @module PaymentRoutes
 * @description API routes for payment operations.
 * Base path: /api/payments
 */

// POST /api/payments/initiate - Start a new payment (COD or Razorpay)
router.post("/initiate", auth, PaymentController.initiatePayment);

// POST /api/payments/verify - Verify Razorpay payment after frontend checkout
router.post("/verify", auth, PaymentController.verifyPayment);

// GET /api/payments/order/:orderId - Get all payments for an order
router.get("/order/:orderId", auth, PaymentController.getPaymentsByOrder);

// GET /api/payments/:id - Get payment details by ID
router.get("/:id", auth, PaymentController.getPayment);

// POST /api/payments/:id/refund - Process full or partial refund
router.post("/:id/refund", auth, PaymentController.refundPayment);

// PUT /api/payments/:id/complete-cod - Mark COD as paid on delivery
router.put("/:id/complete-cod", auth, PaymentController.completeCOD);

export default router;
