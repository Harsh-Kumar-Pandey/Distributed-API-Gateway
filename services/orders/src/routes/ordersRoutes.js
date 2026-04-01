const express = require("express");
const router = express.Router();
const controller = require("../controllers/ordersController");

router.get("/user/:userId", controller.getOrdersByUser);
router.get("/:id", controller.getOrder);
router.get("/", controller.getOrders);
router.post("/", controller.createOrder);
router.patch("/:id/status", controller.updateOrderStatus);

module.exports = router;