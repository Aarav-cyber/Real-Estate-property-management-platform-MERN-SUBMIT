const express = require("express");
const { body } = require("express-validator");

const {
  addProperty,
  getProperties,
  updateProperty,
  deleteProperty,
  assignTenant,
  getPropertyById,
} = require("../controllers/propertyController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("owner"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("location").notEmpty().withMessage("Location is required"),
    body("rent").isNumeric().withMessage("Rent must be a number"),
  ],
  addProperty,
);

// Owner only (validated above)

// All logged-in users
router.get("/", authMiddleware, getProperties);

// Get property by id
router.get("/:id", authMiddleware, getPropertyById);

router.put(
  "/assign/:id",
  authMiddleware,
  roleMiddleware("owner"),
  [
    body("tenantId").notEmpty().withMessage("Tenant ID required"),
    body("leaseStart").optional().isISO8601().withMessage("Invalid start date"),
    body("leaseEnd").optional().isISO8601().withMessage("Invalid end date"),
  ],
  assignTenant,
);

// Owner only
router.put("/:id", authMiddleware, roleMiddleware("owner"), updateProperty);
router.delete("/:id", authMiddleware, roleMiddleware("owner"), deleteProperty);

module.exports = router;
