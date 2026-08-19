const Application = require("../models/Application");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const { STAGES } = require("../constants/application.constants");

exports.listApplications = asyncHandler(async (req, res) => {
  const { stage, page = 1, limit = 20 } = req.query;

  const filter = stage ? { stage } : {};

  const skip = (Number(page) - 1) * Number(limit);

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate("user", "name email phone")
      .select("user financial.requestedLoanAmount loanTerms.tenureMonths stage createdAt selfie.status disbursement.status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Application.countDocuments(filter)
  ]);

  success(res, {
    applications,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  }, "Applications fetched");
});

exports.getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("user", "name email phone emailVerified phoneVerified role createdAt")
    .populate("kyc")
    .populate("selfie.reviewedBy", "name email")
    .populate("disbursement.confirmedBy", "name email");

  if (!application) {
    return res.status(404).json({
      success: false,
      message: "Application not found"
    });
  }

  success(res, { application }, "Full application fetched");
});

exports.reviewSelfie = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;

  if (!["APPROVE", "REJECT"].includes(action)) {
    throw new Error("action must be APPROVE or REJECT");
  }

  if (action === "REJECT" && !reason?.trim()) {
    throw new Error("Rejection reason is required");
  }

  const application = await Application.findById(
    req.params.id
  );

  if (!application) {
    throw new Error("Application not found");
  }

  // Cloudinary image check
  if (!application.selfie?.url) {
    throw new Error("No selfie submitted");
  }

  application.selfie.status =
    action === "APPROVE"
      ? "APPROVED"
      : "REJECTED";

  application.selfie.rejectionReason =
    action === "REJECT"
      ? reason.trim()
      : undefined;

  application.selfie.reviewedBy =
    req.user._id;

  application.selfie.reviewedAt =
    new Date();

  application.stage =
    action === "APPROVE"
      ? STAGES.DISBURSEMENT_PENDING
      : STAGES.SELFIE_REJECTED;

  await application.save();

  success(
    res,
    { application },
    `Selfie ${
      action === "APPROVE"
        ? "approved"
        : "rejected"
    }`
  );
});

exports.confirmDisbursement = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) throw new Error("Application not found");

  if (application.selfie.status !== "APPROVED") {
    return res.status(400).json({
      success: false,
      message: "Selfie must be approved before disbursement"
    });
  }

  application.disbursement = {
    status: "CONFIRMED",
    confirmedBy: req.user._id,
    confirmedAt: new Date()
  };

  application.stage = STAGES.DISBURSED;

  await application.save();

  success(res, { application }, "Disbursement confirmed");
});
