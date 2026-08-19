const router = require("express").Router();
const controller = require("../controllers/loan.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.post("/eligibility", authenticate, authorize("CUSTOMER"), controller.checkEligibility);
router.post("/calculate", authenticate, authorize("CUSTOMER"), controller.calculate);
router.post("/select-term", authenticate, authorize("CUSTOMER"), controller.selectTerm);

module.exports = router;
