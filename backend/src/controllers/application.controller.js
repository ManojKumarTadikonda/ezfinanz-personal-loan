const Application = require("../models/Application");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const { STAGES } = require("../constants/application.constants");
const {sendNotificationToAdmins} = require("../services/notification.service");
const {
  uploadToCloudinary
} = require("../utils/cloudinaryUpload");
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

exports.uploadSelfie = asyncHandler(
  async (req, res) => {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Selfie/photo is required"
      });
    }

    const application =
      await Application.findOne({
        user: req.user._id
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found"
      });
    }

    if (
      !application.declaration ||
      !application.declaration.accepted
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Accept declaration before submitting selfie"
      });
    }

    // Upload selfie to Cloudinary
    const uploadResult =
      await uploadToCloudinary(
        req.file.buffer,
        {
          folder:
            "ezfinanz/selfies"
        }
      );

    console.log(
      "Cloudinary upload:",
      uploadResult.secure_url
    );

    application.selfie = {
      url: uploadResult.secure_url,

      publicId:
        uploadResult.public_id,

      status: "PENDING",

      uploadedAt: new Date()
    };

    application.stage =
      STAGES.ADMIN_REVIEW;

    await application.save();

    // Firebase notification
    await sendNotificationToAdmins({
      title: "Selfie Review Required",

      body:
        `${req.user.name || "A customer"} ` +
        "submitted a selfie for review.",

      data: {
        type: "SELFIE_SUBMITTED",

        applicationId:
          application._id.toString()
      }
    });

    success(
      res,
      {
        application,
        selfie: {
          url:
            uploadResult.secure_url,

          publicId:
            uploadResult.public_id
        }
      },
      "Selfie uploaded successfully. Waiting for admin review"
    );
  }
);

exports.getMyApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    user: req.user._id
  })
    .populate("kyc")
    .populate("user", "name email phone emailVerified phoneVerified role");

  success(res, { application }, "Application details");
});
