const Property = require("../models/Property");
const Lease = require("../models/Lease");
const { validationResult } = require("express-validator");

// ➕ Add Property (Owner only)
exports.addProperty = async (req, res) => {
  try {
    const { title, location, rent, lat, lng } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ success: false, message: errors.array()[0].msg });

    const property = await Property.create({
      title,
      location,
      rent,
      lat,
      lng,
      owner: req.user.id,
    });

    const populated = await Property.findById(property._id)
      .populate("owner", "name email")
      .populate({
        path: "leases",
        populate: { path: "tenant", select: "name email" },
      });

    return res
      .status(201)
      .json({ success: true, message: "Property created", data: populated });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 📥 Get All Properties
exports.getProperties = async (req, res) => {
  try {
    let query = {};
    if (req.user && req.user.role === 'owner') {
      query.owner = req.user.id;
    }

    const properties = await Property.find(query)
      .populate("owner", "name email")
      .populate({
        path: "leases",
        populate: { path: "tenant", select: "name email" },
      });

    return res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✏️ Update Property
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    // Only owner can update
    if (property.owner.toString() !== req.user.id)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    Object.assign(property, req.body);
    await property.save();

    const populated = await Property.findById(property._id)
      .populate("owner", "name email")
      .populate({
        path: "leases",
        populate: { path: "tenant", select: "name email" },
      });

    return res.json({
      success: true,
      message: "Property updated",
      data: populated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ❌ Delete Property
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    if (property.owner.toString() !== req.user.id)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    await property.deleteOne();

    return res.json({ success: true, message: "Property deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.assignTenant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ success: false, message: errors.array()[0].msg });
    const { tenantId, leaseStart, leaseEnd } = req.body;

    const property = await Property.findById(req.params.id);
    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    if (property.owner.toString() !== req.user.id)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    // Create a Lease and attach it to the property
    const lease = await Lease.create({
      tenant: tenantId,
      property: property._id,
      startDate: leaseStart,
      endDate: leaseEnd,
    });
    property.leases.push(lease._id);
    await property.save();

    const populated = await Property.findById(property._id)
      .populate("owner", "name email")
      .populate({
        path: "leases",
        populate: { path: "tenant", select: "name email" },
      });

    return res.json({
      success: true,
      message: "Tenant assigned and lease created",
      data: { property: populated, lease },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get property by id
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("owner", "name email")
      .populate({
        path: "leases",
        populate: { path: "tenant", select: "name email" },
      });

    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    return res.json({ success: true, data: property });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
