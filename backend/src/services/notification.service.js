const User = require("../models/User");
const { messaging } = require("../config/firebase");

async function sendNotificationToAdmins({
  title,
  body,
  data = {}
}) {
  const admins = await User.find({
    role: "ADMIN",
    "fcmTokens.0": { $exists: true }
  });

  const tokens = [];

  for (const admin of admins) {
    for (const token of admin.fcmTokens || []) {
      if (token.token) {
        tokens.push(token.token);
      }
    }
  }

  if (tokens.length === 0) {
    console.log("No admin FCM tokens registered.");
    return;
  }

  const message = {
    notification: {
      title,
      body
    },

    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        String(value)
      ])
    ),

    webpush: {
      fcmOptions: {
        link:
          data.applicationId
            ? `/admin/applications/${data.applicationId}`
            : "/admin"
      }
    },

    tokens
  };

  try {
    const response = await messaging.sendEachForMulticast(message);

    console.log(
      `FCM notification sent: ${response.successCount} successful, ${response.failureCount} failed`
    );

    const invalidTokens = [];

    response.responses.forEach((result, index) => {
      if (!result.success) {
        const errorCode = result.error?.code;

        if (
          errorCode === "messaging/registration-token-not-registered" ||
          errorCode === "messaging/invalid-registration-token"
        ) {
          invalidTokens.push(tokens[index]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      await User.updateMany(
        { role: "ADMIN" },
        {
          $pull: {
            fcmTokens: {
              token: { $in: invalidTokens }
            }
          }
        }
      );
    }

    return response;
  } catch (error) {
    console.error("FCM notification error:", error);
  }
}

module.exports = {
  sendNotificationToAdmins
};