const KYC = require("../models/KYC");
const Application = require("../models/Application");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const { STAGES } = require("../constants/application.constants");

exports.submitKyc = asyncHandler(async (req, res) => {
  if (!req.user.emailVerified || !req.user.phoneVerified) {
    return res.status(403).json({
      success: false,
      message: "Verify both email and phone before submitting KYC"
    });
  }

  const data = {
    user: req.user._id,
    fullName: req.body.fullName,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    address: req.body.address,
    idType: req.body.idType,
    idNumber: req.body.idNumber,
    idDocumentPath: req.file ? req.file.path : undefined
  };

  const kyc = await KYC.findOneAndUpdate(
    { user: req.user._id },
    data,
    { new: true, upsert: true, runValidators: true }
  );

  const application = await Application.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      kyc: kyc._id,
      stage: STAGES.ELIGIBILITY
    },
    { new: true, upsert: true }
  );

  success(res, { kyc, application }, "KYC submitted");
});

exports.getKyc = asyncHandler(async (req, res) => {
  const kyc = await KYC.findOne({ user: req.user._id });

  success(res, { kyc }, "KYC details");
});
