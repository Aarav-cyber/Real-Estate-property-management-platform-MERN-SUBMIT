const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const startCronJobs = require("./utils/cron");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Cron Jobs
startCronJobs();

const app = express();
const errorHandler = require("./middleware/errorHandler");
// ================= MIDDLEWARE =================
app.use(express.json()); // Parse JSON
app.use(cors()); // Enable CORS

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));
// requests
app.use("/api/requests", require("./routes/requestRoutes"));

// Test route
app.get("/test", (req, res) => {
  res.send("API working");
});

// ================= PROTECTED ROUTE =================
const authMiddleware = require("./middleware/authMiddleware");

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed",
    data: { user: req.user },
  });
});

// payments
app.use("/api/payments", require("./routes/paymentRoutes"));

//leases
app.use("/api/leases", require("./routes/leaseRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(errorHandler);

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
