const router = require("express").Router();
const controller = require("../controllers/admin.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.use(authenticate, authorize("ADMIN"));

router.get("/applications", controller.listApplications);
router.get("/applications/:id", controller.getApplication);
router.patch("/applications/:id/selfie", controller.reviewSelfie);
router.patch("/applications/:id/disbursement", controller.confirmDisbursement);

module.exports = router;
