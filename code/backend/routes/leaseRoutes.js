const express = require("express");
const { body } = require("express-validator");

const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  uploadLease,
  createLease,
  getLeases,
  getLeaseById,
} = require("../controllers/leaseController");

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  roleMiddleware("owner"),
  upload.single("file"),
  [body("leaseId").notEmpty().withMessage("Lease ID required")],
  uploadLease,
);

// Create lease (owner)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("owner"),
  [
    body("tenantId").notEmpty().withMessage("Tenant ID required"),
    body("propertyId").notEmpty().withMessage("Property ID required"),
    body("startDate").notEmpty().isISO8601().withMessage("Invalid start date"),
    body("endDate").notEmpty().isISO8601().withMessage("Invalid end date"),
  ],
  createLease,
);

// Get lease by id
router.get("/:id", authMiddleware, getLeaseById);

// Get leases (any authenticated user)
router.get("/", authMiddleware, getLeases);

module.exports = router;
