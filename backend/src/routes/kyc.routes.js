const router = require("express").Router();
const controller = require("../controllers/kyc.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  upload.single("idDocument"),
  controller.submitKyc
);

router.get(
  "/me",
  authenticate,
  authorize("CUSTOMER"),
  controller.getKyc
);

module.exports = router;
