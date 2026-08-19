const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const { messaging } = require("../config/firebase");

exports.registerToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "FCM token is required"
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  if (user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Only admins can register notification tokens"
    });
  }

  const existing = user.fcmTokens.find(
    item => item.token === token
  );

  if (existing) {
    existing.lastUsedAt = new Date();
  } else {
    user.fcmTokens.push({
      token,
      platform: "WEB",
      createdAt: new Date(),
      lastUsedAt: new Date()
    });
  }

  await user.save();

  success(
    res,
    {},
    "Notification token registered"
  );
});

exports.removeToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  await User.updateOne(
    { _id: req.user._id },
    {
      $pull: {
        fcmTokens: {
          token
        }
      }
    }
  );

  success(
    res,
    {},
    "Notification token removed"
  );
});

// controllers/notification.controller.js


exports.testNotification = async (req, res) => {
  try {
    const admin = await User.findOne({
      role: "ADMIN"
    });

    if (!admin || !admin.fcmTokens?.length) {
      return res.status(404).json({
        success: false,
        message: "No FCM tokens found"
      });
    }

    const tokens = admin.fcmTokens.map(
      item => item.token
    );

    console.log("Sending to tokens:", tokens.length);

    const response =
      await messaging.sendEachForMulticast({
        tokens,

        notification: {
          title: "EZFINANZ Test Notification",
          body: "Firebase notification is working!"
        },

        data: {
          type: "TEST_NOTIFICATION"
        }
      });

    console.log(
      "Success:",
      response.successCount
    );

    console.log(
      "Failed:",
      response.failureCount
    );

    response.responses.forEach(
      (result, index) => {
        console.log(
          `Token ${index}:`,
          result.success
            ? "SUCCESS"
            : result.error?.code
        );
      }
    );

    return res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error(
      "FCM TEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
      code: error.code
    });
  }
};