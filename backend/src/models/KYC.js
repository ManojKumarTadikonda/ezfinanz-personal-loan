const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  fullName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  gender: {
    type: String,
    enum: ["MALE", "FEMALE", "OTHER"],
    required: true
  },
  address: {
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  idType: {
    type: String,
    enum: ["PAN", "AADHAAR", "PASSPORT", "DRIVING_LICENSE"],
    required: true
  },
  idNumber: { type: String, required: true, trim: true },
  idDocumentPath: String
}, { timestamps: true });

module.exports = mongoose.model("KYC", kycSchema);
