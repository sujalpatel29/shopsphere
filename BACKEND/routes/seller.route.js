import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/auth.middleware.js";
import { sellerOnly } from "../middlewares/seller.middleware.js";
import * as sellerController from "../controllers/seller.controller.js";

const router = express.Router();

router.post("/apply", auth, sellerController.applyToBeSeller);
router.get("/profile", auth, sellerOnly, sellerController.getMySellerProfile);
router.put("/profile", auth, sellerOnly, sellerController.updateMySellerProfile);
router.get("/analytics", auth, sellerOnly, sellerController.getSellerAnalytics);
router.get("/orders", auth, sellerOnly, sellerController.getSellerOrders);
router.get("/orders/:orderId", auth, sellerOnly, sellerController.getSellerOrderDetail);

router.get("/admin/sellers", auth, adminOnly, sellerController.getAllSellers);
router.get("/admin/sellers/:sellerId", auth, adminOnly, sellerController.getSellerById);
router.put("/admin/sellers/:sellerId/verify", auth, adminOnly, sellerController.verifySeller);
router.put("/admin/sellers/:sellerId/block", auth, adminOnly, sellerController.blockSeller);

export default router;
