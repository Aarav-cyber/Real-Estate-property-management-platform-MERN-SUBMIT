const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    rent: {
      type: Number,
      required: true,
      min: 0,
    },
    lat: {
      type: Number,
      default: 12.9716,
    },
    lng: {
      type: Number,
      default: 77.5946,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaseDocument: {
      type: String,
    },
    leases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lease",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Property", propertySchema);
