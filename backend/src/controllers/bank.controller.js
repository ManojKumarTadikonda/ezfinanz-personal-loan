const Application = require("../models/Application");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const { STAGES } = require("../constants/application.constants");

exports.addBankAccount = asyncHandler(async (req, res) => {
  const {
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName
  } = req.body;

  if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
    throw new Error("All bank account fields are required");
  }

  const application = await Application.findOneAndUpdate(
    { user: req.user._id },
    {
      bankAccount: {
        accountHolderName,
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
        bankName
      },
      stage: STAGES.DECLARATION
    },
    { new: true }
  );

  if (!application) throw new Error("Loan application not found");

  success(res, { application }, "Bank account saved");
});
