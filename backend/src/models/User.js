const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  passwordHash: {
    type: String
  },
  role: {
    type: String,
    enum: ["CUSTOMER", "ADMIN"],
    default: "CUSTOMER"
  },
  authProvider: {
    type: String,
    enum: ["LOCAL", "GOOGLE", "PHONE"],
    default: "LOCAL"
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  phoneOtpHash: String,
  phoneOtpExpires: Date,
  fcmTokens: [
  {
    token: {
      type: String,
      trim: true
    },
    platform: {
      type: String,
      enum: ["WEB"],
      default: "WEB"
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  }
]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
