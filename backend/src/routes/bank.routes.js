const router = require("express").Router();
const controller = require("../controllers/bank.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.post("/", authenticate, authorize("CUSTOMER"), controller.addBankAccount);

module.exports = router;
