const router = require("express").Router();
const controller = require("../controllers/application.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.post(
  "/declaration",
  authenticate,
  authorize("CUSTOMER"),
  controller.acceptDeclaration
);

router.post(
  "/selfie",
  authenticate,
  authorize("CUSTOMER"),
  upload.single("selfie"),
  controller.uploadSelfie
);

router.get(
  "/me",
  authenticate,
  authorize("CUSTOMER"),
  controller.getMyApplication
);

module.exports = router;
