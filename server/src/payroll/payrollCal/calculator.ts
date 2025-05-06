export interface salaryData {
  grossSalary: number;
  totalAllowanceArray: { label: string; amount: number }[];
  totalDeductionArray: { label: string; amount: number }[];
  totalDeduction: number;
  payeTax: number;
  netSalary: number;
}


export function calculateSalary(
  dto: {
    basicSalary: number;
    allowanceP: { label: string; amount: number }[];
    allowanceV: { label: string; amount: number }[];
    deductionsP: { label: string; amount: number }[];
    deductionsV: { label: string; amount: number }[];
  },
  payeData,
): salaryData {

  //Calculating & Mapping Addition Amounts(Percentages)
  const calculatedAllowance = dto.allowanceP.map((allowance) => ({
    label: allowance.label,
    amount: (allowance.amount / 100) * dto.basicSalary,
  }));

  //Calculating & Mapping Deduction Amounts(Percentages)
  const calculatedDeduction = dto.deductionsP.map((deduction) => ({
    label: deduction.label,
    amount: (deduction.amount / 100) * dto.basicSalary,
  }));

  //Merge Calculated Percentage Amounts and Values
  const totalAllowanceArray = [...calculatedAllowance, ...dto.allowanceV];
  const totalDeductionArray = [...calculatedDeduction, ...dto.deductionsV];


  //Calculate Total Deduction Amount
  const totalDeduction = totalDeductionArray.reduce(
    (sum, d) => sum + d.amount,
    0,
  );

  //Calculate Total Addition Amount
  const totalAllowance = totalAllowanceArray.reduce(
    (sum, a) => sum + a.amount,
    0,
  );

  //Calculate Gross Salary
  const grossSalary = dto.basicSalary + totalAllowance;


  //Calculation of Paye Tax Amount
  let taxLevel: number;
  for (const level of payeData) {
    const upper = level.upperLimit ?? Infinity;
    if (grossSalary * 12 < upper) {
      taxLevel = level.orderId;
      break
    }
  }
  let paye = 0;

  for (const level of payeData) {
    if (level.orderId == taxLevel) {
      var taxableAmount =
        ((grossSalary * 12 - level.lowerLimit) * level.taxRate) / 100;
      paye += taxableAmount;
      break;
    }
    var levelTax =
      ((level.upperLimit - level.lowerLimit) * level.taxRate) / 100;
    paye += levelTax;
  }
  const payeTax = paye / 12;


  //Calculate Net Salary
  const netSalary = grossSalary - (totalDeduction + payeTax);

  return {
    grossSalary,
    totalAllowanceArray,
    totalDeductionArray,
    totalDeduction,
    payeTax,
    netSalary,
  };
}
