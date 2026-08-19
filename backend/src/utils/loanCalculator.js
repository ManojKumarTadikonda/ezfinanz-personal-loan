function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateEMI(principal, annualRate, tenureMonths) {
  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }

  return (
    principal *
    monthlyRate *
    Math.pow(1 + monthlyRate, tenureMonths)
  ) / (
    Math.pow(1 + monthlyRate, tenureMonths) - 1
  );
}

/*
  The challenge asks for applicable interest, processing fee, GST,
  other charges, EMI, interest, repayment, net disbursement and IRR.

  IRR here is an approximate annualized internal rate of return
  calculated by binary-searching the monthly rate for the cash flows:
  borrower receives net disbursement at time 0 and pays EMI thereafter.
*/
function calculateIRR(netDisbursement, emi, tenureMonths) {
  if (netDisbursement <= 0 || emi <= 0) return 0;

  let low = -0.99;
  let high = 1.0;

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    let npv = -netDisbursement;

    for (let month = 1; month <= tenureMonths; month++) {
      npv += emi / Math.pow(1 + mid, month);
    }

    if (npv > 0) low = mid;
    else high = mid;
  }

  const monthlyIrr = (low + high) / 2;
  return (Math.pow(1 + monthlyIrr, 12) - 1) * 100;
}

function calculateLoanTerms({
  loanAmount,
  tenureMonths,
  annualInterestRate = 12,
  processingFeePercent = 2,
  gstPercent = 18,
  otherCharges = 0
}) {
  const processingFee = loanAmount * processingFeePercent / 100;
  const gstAmount = processingFee * gstPercent / 100;
  const totalCharges = processingFee + gstAmount + otherCharges;
  const netDisbursementAmount = loanAmount - totalCharges;

  const monthlyEmi = calculateEMI(
    loanAmount,
    annualInterestRate,
    tenureMonths
  );

  const totalRepayment = monthlyEmi * tenureMonths;
  const totalInterest = totalRepayment - loanAmount;
  const irr = calculateIRR(
    netDisbursementAmount,
    monthlyEmi,
    tenureMonths
  );

  return {
    loanAmount: round2(loanAmount),
    tenureMonths,
    annualInterestRate: round2(annualInterestRate),
    processingFeePercent: round2(processingFeePercent),
    processingFee: round2(processingFee),
    gstPercent: round2(gstPercent),
    gstAmount: round2(gstAmount),
    otherCharges: round2(otherCharges),
    totalCharges: round2(totalCharges),
    netDisbursementAmount: round2(netDisbursementAmount),
    monthlyEmi: round2(monthlyEmi),
    totalInterest: round2(totalInterest),
    totalRepayment: round2(totalRepayment),
    irr: round2(irr)
  };
}

module.exports = { calculateLoanTerms };
