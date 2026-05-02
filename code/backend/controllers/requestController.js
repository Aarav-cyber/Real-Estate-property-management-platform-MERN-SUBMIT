const Request = require("../models/Request");
const Lease = require("../models/Lease");
const Property = require("../models/Property");

// Tenant sends a request for a property
exports.createRequest = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    const existing = await Request.findOne({
      tenant: req.user.id,
      property: propertyId,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Request already sent" });
    }

    const request = await Request.create({
      tenant: req.user.id,
      property: propertyId,
    });

    res.status(201).json({
      success: true,
      message: "Request sent to owner",
      data: request,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Owner views requests for their properties
exports.getRequests = async (req, res) => {
  try {
    // find properties owned by this owner
    const properties = await Property.find({ owner: req.user.id }).select("_id");
    const propIds = properties.map((p) => p._id);

    const requests = await Request.find({ property: { $in: propIds } })
      .populate("tenant", "name email")
      .populate("property", "title location owner");

    return res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Owner accepts a request and creates a lease
exports.acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    const property = await Property.findById(request.property);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    // ensure the current user is the owner
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    request.status = "accepted";
    await request.save();

    res.json({
      success: true,
      message: "Request accepted",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Owner rejects a request
exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    const property = await Property.findById(request.property);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    request.status = "rejected";
    await request.save();

    res.json({ success: true, message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
