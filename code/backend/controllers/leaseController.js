const Lease = require("../models/Lease");
const Property = require("../models/Property");
const Request = require("../models/Request");
const { validationResult } = require("express-validator");

// ➕ Create Lease
exports.createLease = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ success: false, message: errors.array()[0].msg });

    const { tenantId, propertyId, startDate, endDate } = req.body;

    const lease = await Lease.create({
      tenant: tenantId,
      property: propertyId,
      startDate,
      endDate,
    });

    // link lease to property
    await Property.findByIdAndUpdate(propertyId, {
      $push: { leases: lease._id },
    });

    // Delete any accepted request for this tenant and property
    await Request.findOneAndDelete({ tenant: tenantId, property: propertyId, status: "accepted" });

    const populated = await Lease.findById(lease._id)
      .populate("tenant", "name email")
      .populate("property", "title location");

    return res
      .status(201)
      .json({ success: true, message: "Lease created", data: populated });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 📥 Get Leases
exports.getLeases = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'owner') {
      const properties = await Property.find({ owner: req.user.id }).select('_id');
      const propertyIds = properties.map(p => p._id);
      filter.property = { $in: propertyIds };
    } else if (req.user.role === 'tenant') {
      filter.tenant = req.user.id;
    }

    const leases = await Lease.find(filter)
      .populate("tenant", "name email")
      .populate("property", "title location");

    return res.json({ success: true, count: leases.length, data: leases });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Attach uploaded file to a Lease record
exports.uploadLease = async (req, res) => {
  try {
    const errors = validationResult(req);
    // form fields available in req.body after multer
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ success: false, message: errors.array()[0].msg });
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });

    const { leaseId } = req.body;

    const lease = await Lease.findById(leaseId);
    if (!lease)
      return res
        .status(404)
        .json({ success: false, message: "Lease not found" });

    lease.document = `/uploads/${req.file.filename}`;
    await lease.save();

    const populated = await Lease.findById(lease._id)
      .populate("tenant", "name email")
      .populate("property", "title location");

    return res.json({
      success: true,
      message: "Lease document uploaded",
      data: populated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get lease by id
exports.getLeaseById = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate("tenant", "name email")
      .populate("property", "title location");
    if (!lease)
      return res
        .status(404)
        .json({ success: false, message: "Lease not found" });
    return res.json({ success: true, data: lease });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
