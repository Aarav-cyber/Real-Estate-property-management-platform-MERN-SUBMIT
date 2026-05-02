const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["paid","pending"], default: "paid" },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);