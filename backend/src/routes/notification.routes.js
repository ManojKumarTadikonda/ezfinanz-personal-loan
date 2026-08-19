const router = require("express").Router();

const controller =
  require("../controllers/notification.controller");

const {
  authenticate,
  authorize
} = require("../middleware/auth.middleware");

router.post(
  "/token",
  authenticate,
  authorize("ADMIN"),
  controller.registerToken
);

router.delete(
  "/token",
  authenticate,
  authorize("ADMIN"),
  controller.removeToken
);

router.post(
  "/test",
  authenticate,
  authorize("ADMIN"),
  controller.testNotification
);

module.exports = router;