const Application = require("../models/Application");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const { calculateEligibility } = require("../utils/eligibility");
const { calculateLoanTerms } = require("../utils/loanCalculator");
const { STAGES, ELIGIBILITY } = require("../constants/application.constants");

const TENURES = [6, 12, 18, 24, 36];

function assertPositiveNumber(value, name) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
    throw new Error(`${name} must be a positive number`);
  }
}

exports.checkEligibility = asyncHandler(async (req, res) => {
  const {
    monthlyIncome,
    annualIncome,
    requestedLoanAmount,
    creditScore,
    currentDebts,
    employerName,
    designation
  } = req.body;

  assertPositiveNumber(monthlyIncome, "monthlyIncome");
  assertPositiveNumber(requestedLoanAmount, "requestedLoanAmount");

  if (Number(creditScore) < 300 || Number(creditScore) > 900) {
    throw new Error("creditScore must be between 300 and 900");
  }

  const result = calculateEligibility({
    monthlyIncome,
    requestedLoanAmount,
    creditScore,
    currentDebts
  });

  const application = await Application.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      financial: {
        monthlyIncome,
        annualIncome,
        requestedLoanAmount,
        creditScore,
        currentDebts: currentDebts || 0,
        employerName,
        designation
      },
      eligibility: {
        ...result,
        checkedAt: new Date()
      },
      stage: STAGES.ELIGIBILITY
    },
    { new: true, upsert: true }
  );

  success(res, { eligibility: result, application }, "Eligibility calculated");
});

exports.calculate = asyncHandler(async (req, res) => {
  const {
    loanAmount,
    tenureMonths,
    annualInterestRate = 12,
    processingFeePercent = 2,
    gstPercent = 18,
    otherCharges = 0
  } = req.body;

  assertPositiveNumber(loanAmount, "loanAmount");

  if (!TENURES.includes(Number(tenureMonths))) {
    throw new Error(`tenureMonths must be one of: ${TENURES.join(", ")}`);
  }

  const terms = calculateLoanTerms({
    loanAmount: Number(loanAmount),
    tenureMonths: Number(tenureMonths),
    annualInterestRate: Number(annualInterestRate),
    processingFeePercent: Number(processingFeePercent),
    gstPercent: Number(gstPercent),
    otherCharges: Number(otherCharges)
  });

  success(res, { terms }, "Loan terms calculated");
});

exports.selectTerm = asyncHandler(async (req, res) => {
  const application = await Application.findOne({ user: req.user._id });

  if (!application) throw new Error("Loan application not found");

  if (application.eligibility.result === ELIGIBILITY.NOT_ELIGIBLE) {
    return res.status(400).json({
      success: false,
      message: "Customer is not eligible for a loan"
    });
  }

  const {
    loanAmount,
    tenureMonths,
    annualInterestRate = 12,
    processingFeePercent = 2,
    gstPercent = 18,
    otherCharges = 0
  } = req.body;

  if (Number(loanAmount) > Number(application.eligibility.maxEligibleAmount)) {
    return res.status(400).json({
      success: false,
      message: "Loan amount exceeds maximum eligible amount"
    });
  }

  const terms = calculateLoanTerms({
    loanAmount: Number(loanAmount),
    tenureMonths: Number(tenureMonths),
    annualInterestRate: Number(annualInterestRate),
    processingFeePercent: Number(processingFeePercent),
    gstPercent: Number(gstPercent),
    otherCharges: Number(otherCharges)
  });

  application.loanTerms = terms;
  application.stage = STAGES.BANK_ACCOUNT;

  await application.save();

  success(res, { application }, "EMI term selected");
});

module.exports = exports;
