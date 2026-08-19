const mongoose = require("mongoose");
const { STAGES, ELIGIBILITY } = require("../constants/application.constants");

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  stage: {
    type: String,
    enum: Object.values(STAGES),
    default: STAGES.EMAIL_PHONE_VERIFICATION
  },

  kyc: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KYC"
  },

  financial: {
    monthlyIncome: Number,
    annualIncome: Number,
    requestedLoanAmount: Number,
    creditScore: Number,
    currentDebts: Number,
    employerName: String,
    designation: String
  },

  eligibility: {
    result: {
      type: String,
      enum: Object.values(ELIGIBILITY)
    },
    debtToIncomeRatio: Number,
    maxEligibleAmount: Number,
    reason: String,
    checkedAt: Date
  },

  loanTerms: {
    loanAmount: Number,
    tenureMonths: Number,
    annualInterestRate: Number,
    processingFeePercent: Number,
    processingFee: Number,
    gstPercent: Number,
    gstAmount: Number,
    otherCharges: Number,
    totalCharges: Number,
    netDisbursementAmount: Number,
    monthlyEmi: Number,
    totalInterest: Number,
    totalRepayment: Number,
    irr: Number
  },

  bankAccount: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },

  declaration: {
    accepted: { type: Boolean, default: false },
    acceptedAt: Date
  },

  selfie: {
    path: String,
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"]
    },
    rejectionReason: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewedAt: Date
  },

  disbursement: {
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED"],
      default: "PENDING"
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    confirmedAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);
