const { validationResult } = require("express-validator");
const Payment = require("../models/Payment");
const Property = require("../models/Property");
const razorpay = require("../utils/razorpay");

const crypto = require("crypto");

// ➕ Add Payment (Tenant only)
exports.addPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ success: false, message: errors.array()[0].msg });
    const { propertyId, amount, status, existingPaymentId } = req.body;

    let payment;
    if (existingPaymentId) {
      payment = await Payment.findByIdAndUpdate(
        existingPaymentId,
        { status, paymentDate: new Date() },
        { new: true }
      );
    } else {
      payment = await Payment.create({
        tenant: req.user.id,
        property: propertyId,
        amount,
        status,
      });
    }

    const populated = await Payment.findById(payment._id)
      .populate("tenant", "name email")
      .populate("property", "title location");

    return res
      .status(201)
      .json({ success: true, message: existingPaymentId ? "Payment updated" : "Payment added", data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ➕ Issue Payment (Owner only)
exports.issuePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
      
    const { tenantId, propertyId, amount } = req.body;

    const property = await Property.findById(propertyId);
    if (!property || property.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to issue payment for this property" });
    }

    const payment = await Payment.create({
      tenant: tenantId,
      property: propertyId,
      amount,
      status: "pending",
    });

    const populated = await Payment.findById(payment._id)
      .populate("tenant", "name email")
      .populate("property", "title location");

    return res.status(201).json({ success: true, message: "Payment issued", data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 📥 Get Payment History
exports.getPayments = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'owner') {
      const properties = await Property.find({ owner: req.user.id }).select('_id');
      const propertyIds = properties.map(p => p._id);
      filter.property = { $in: propertyIds };
    } else if (req.user.role === 'tenant') {
      filter.tenant = req.user.id;
    }

    const payments = await Payment.find(filter)
      .populate("tenant", "name email")
      .populate("property", "title location");

    return res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // rupees -> paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      payment_capture: 1, // 1 = auto-capture, 0 = manual capture
    };

    const order = await razorpay.orders.create(options);

    return res.json({ success: true, message: "Order created", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature, propertyId, amount, status, existingPaymentId } =
      req.body;
    const body = `${order_id}|${payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    let saved;
    if (existingPaymentId) {
      saved = await Payment.findByIdAndUpdate(
        existingPaymentId,
        { status: status || "paid", paymentDate: new Date() },
        { new: true }
      );
    } else {
      const paymentData = {
        tenant: req.user?.id || null,
        property: propertyId || null,
        amount: amount || null,
        paymentDate: new Date(),
        status: status || "paid",
      };
      saved = await Payment.create(paymentData);
    }

    const populated = await Payment.findById(saved._id)
      .populate("tenant", "name email")
      .populate("property", "title location");

    return res.json({
      success: true,
      message: "Payment verified",
      data: populated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
