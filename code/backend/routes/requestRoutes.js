const express = require("express");
const {
  createRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
} = require("../controllers/requestController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// tenant sends request
router.post("/", authMiddleware, roleMiddleware("tenant"), createRequest);

// owner views requests
router.get("/", authMiddleware, roleMiddleware("owner"), getRequests);

// owner accepts
router.put(
  "/accept/:id",
  authMiddleware,
  roleMiddleware("owner"),
  acceptRequest,
);

// owner rejects
router.put(
  "/reject/:id",
  authMiddleware,
  roleMiddleware("owner"),
  rejectRequest,
);

module.exports = router;
