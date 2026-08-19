const Application = require("../models/Application");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const { STAGES } = require("../constants/application.constants");

exports.acceptDeclaration = asyncHandler(async (req, res) => {
  if (req.body.accepted !== true) {
    return res.status(400).json({
      success: false,
      message: "Declaration must be accepted"
    });
  }

  const application = await Application.findOneAndUpdate(
    { user: req.user._id },
    {
      declaration: {
        accepted: true,
        acceptedAt: new Date()
      },
      stage: STAGES.SELFIE_PENDING
    },
    { new: true }
  );

  if (!application) throw new Error("Loan application not found");

  success(res, { application }, "Declaration accepted");
});

exports.uploadSelfie = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Selfie/photo is required"
    });
  }

  const application = await Application.findOne({ user: req.user._id });

  if (!application) throw new Error("Loan application not found");

  if (!application.declaration.accepted) {
    return res.status(400).json({
      success: false,
      message: "Accept declaration before submitting selfie"
    });
  }

  application.selfie = {
    path: req.file.path,
    status: "PENDING"
  };

  application.stage = STAGES.ADMIN_REVIEW;

  await application.save();

  success(
    res,
    { application },
    "Selfie submitted. Waiting for admin review"
  );
});

exports.getMyApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    user: req.user._id
  })
    .populate("kyc")
    .populate("user", "name email phone emailVerified phoneVerified role");

  success(res, { application }, "Application details");
});
