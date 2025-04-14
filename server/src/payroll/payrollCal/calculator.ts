export interface salaryData {
  grossSalary: number;
  totalAllowanceArray: { label: string; amount: number }[];
  totalDeductionArray: { label: string; amount: number }[];
  totalDeduction: number;
  netSalary: number;
}

export function calculateSalary(dto: {
  basicSalary: number;
  allowanceP: { label: string; amount: string }[];
  allowanceV: { label: string; amount: number }[];
  deductionsP: { label: string; amount: string }[];
  deductionsV: { label: string; amount: number }[];
}): salaryData {
  const calculatedAllowance = dto.allowanceP.map((allowance) => ({
    label: allowance.label,
    amount: parseFloat(allowance.amount) * dto.basicSalary,
  }));

  const calculatedDeduction = dto.deductionsP.map((deduction) => ({
    label: deduction.label,
    amount: parseFloat(deduction.amount) * dto.basicSalary,
  }));

  const totalAllowanceArray = [...calculatedAllowance, ...dto.allowanceV];
  const totalDeductionArray = [...calculatedDeduction, ...dto.deductionsV];

  const findTotals = () => {
    var totalAllowance = 0;
    var totalDeduction = 0;
    for (const allow of totalAllowanceArray) {
      totalAllowance += (allow.amount);
    }
    for (const deduct of totalDeductionArray) {
      totalDeduction += (deduct.amount);
    }
    return { totalAllowance, totalDeduction };
  };

  const calculateGrossNetSal = (
    allow: number,
    deduct: number,
    basicSalary: number,
  ) => {
    const grossSalary = basicSalary + allow;
    const netSalary = grossSalary - deduct;
    return { grossSalary, netSalary };
  };

  const { totalAllowance, totalDeduction } = findTotals();
  const { grossSalary, netSalary } = calculateGrossNetSal(
    totalAllowance,
    totalDeduction,
    dto.basicSalary,
  );

  return {
    grossSalary,
    totalAllowanceArray,
    totalDeductionArray,
    totalDeduction,
    netSalary,
  };
}


const result = calculateSalary({
    basicSalary: 1000,
    allowanceP: [{ label: "Housing", amount: "0.2" }],
    allowanceV: [{ label: "Bonus", amount: 100 }],
    deductionsP: [{ label: "Tax", amount: "0.05" }],
    deductionsV: [{ label: "Loan", amount: 50 }],
  });
  
  console.log("Salary Calculation Result:", result);
