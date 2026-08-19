const { ELIGIBILITY } = require("../constants/application.constants");

function calculateEligibility({
  monthlyIncome,
  requestedLoanAmount,
  creditScore,
  currentDebts
}) {
  const monthlyDebt = Number(currentDebts || 0);
  const income = Number(monthlyIncome);
  const amount = Number(requestedLoanAmount);
  const score = Number(creditScore);

  const dti = income > 0 ? (monthlyDebt / income) * 100 : 100;

  // Demo policy for the challenge. Replace with a real credit-policy service
  // in production.
  let result = ELIGIBILITY.NOT_ELIGIBLE;
  let maxEligibleAmount = 0;
  let reason = "";

  if (score >= 750 && dti <= 40 && amount <= income * 20) {
    result = ELIGIBILITY.ELIGIBLE;
    maxEligibleAmount = amount;
    reason = "Credit score, debt-to-income ratio and income-to-loan checks passed.";
  } else if (score >= 650 && dti <= 50 && amount <= income * 15) {
    result = ELIGIBILITY.PARTIALLY_ELIGIBLE;
    maxEligibleAmount = Math.min(amount, income * 15);
    reason = "Customer may qualify for a reduced loan amount.";
  } else {
    result = ELIGIBILITY.NOT_ELIGIBLE;
    maxEligibleAmount = 0;
    reason = "Credit score, debt-to-income ratio or income-to-loan check did not meet policy.";
  }

  return {
    result,
    debtToIncomeRatio: Math.round(dti * 100) / 100,
    maxEligibleAmount: Math.round(maxEligibleAmount * 100) / 100,
    reason
  };
}

module.exports = { calculateEligibility };
