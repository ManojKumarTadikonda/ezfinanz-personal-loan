const router = require("express").Router();
const controller = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/oauth", controller.oauth);

router.post("/verify-email", authenticate, controller.verifyEmail);
router.post("/send-phone-otp", authenticate, controller.sendPhoneOtp);
router.post("/verify-phone", authenticate, controller.verifyPhone);
router.get("/me", authenticate, controller.me);

module.exports = router;
