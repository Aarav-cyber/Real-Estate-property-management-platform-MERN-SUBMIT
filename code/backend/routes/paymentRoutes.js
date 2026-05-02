const express = require("express");
const { body } = require("express-validator");


const { addPayment, getPayments, createOrder, verifyPayment, issuePayment } = require("../controllers/paymentController");



const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/create-order", authMiddleware, createOrder);
//VerifyPayment
router.post("/verify", authMiddleware, verifyPayment);

// Owner issues a payment
router.post(
  "/issue",
  authMiddleware,
  roleMiddleware("owner"),
  [
    body("tenantId").notEmpty().withMessage("Tenant ID required"),
    body("propertyId").notEmpty().withMessage("Property ID required"),
    body("amount").isNumeric().withMessage("Amount must be number"),
  ],
  issuePayment
);

// Tenant pays
router.post(
  "/",
  authMiddleware,
  roleMiddleware("tenant"),
  [
    body("propertyId").notEmpty().withMessage("Property ID required"),
    body("amount").isNumeric().withMessage("Amount must be number"),
    body("status").optional().isIn(["paid", "pending"]).withMessage("Invalid status"),
  ],
  addPayment
);

// View payments (all logged-in users)
router.get("/", authMiddleware, getPayments);

module.exports = router;