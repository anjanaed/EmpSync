import { DatabaseService } from 'src/database/database.service';

export interface salaryData {
  grossSalary: number;
  totalAllowanceArray: { label: string; amount: number }[];
  totalDeductionArray: { label: string; amount: number }[];
  totalDeduction: number;
  paye:number;
  netSalary: number;
}

 function calculatePaye(payeData, grossSalary: number):number {
  var taxLevel:number;
  for(const level in payeData){
    if(grossSalary*12<payeData[level].upperLimit){
      taxLevel=payeData[level].orderId;
      break;
    }
  }
  var payeTax=0;

  for (const level in payeData){
    if(payeData[level].orderId==taxLevel){
      var taxableAmount=((grossSalary*12)-payeData[level].lowerLimit)*payeData[level].taxRate/100;
      payeTax+=taxableAmount;
      break;
    }
    var levelTax=(payeData[level].upperLimit-payeData[level].lowerLimit)*payeData[level].taxRate/100
    payeTax+=levelTax;
  }

  console.log(`Payee Tax: ${(payeTax/12).toFixed(2)}`);
  return parseFloat((payeTax/12).toFixed(2))



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
    const calculatedAllowance = dto.allowanceP.map((allowance) => ({
      label: allowance.label,
      amount: (allowance.amount / 100) * dto.basicSalary,
    }));

    const calculatedDeduction = dto.deductionsP.map((deduction) => ({
      label: deduction.label,
      amount: (deduction.amount / 100) * dto.basicSalary,
    }));

    const totalAllowanceArray = [...calculatedAllowance, ...dto.allowanceV];
    const totalDeductionArray = [...calculatedDeduction, ...dto.deductionsV];

    const findTotals = () => {
      var totalAllowance = 0;
      var totalDeduction = 0;
      for (const allow of totalAllowanceArray) {
        totalAllowance += allow.amount;
      }
      for (const deduct of totalDeductionArray) {
        totalDeduction += deduct.amount;
      }
      return { totalAllowance, totalDeduction };
    };

    const calculateGrossNetSal = (
      allow: number,
      deduct: number,
      basicSalary: number,
    ) => {
      const grossSalary = basicSalary + allow;
      const paye= calculatePaye(payeData,grossSalary)
      const netSalary = grossSalary - (deduct + paye);
      return { grossSalary, netSalary,paye };
    };

    const { totalAllowance, totalDeduction } = findTotals();
    const { grossSalary, netSalary,paye } = calculateGrossNetSal(
      totalAllowance,
      totalDeduction,
      dto.basicSalary,
    );

    return {
      grossSalary,
      totalAllowanceArray,
      totalDeductionArray,
      totalDeduction,
      paye,
      netSalary,
    };
  }


  // calculatePaye([
  //   { id: 8, orderId: 1, lowerLimit: 0, upperLimit: 1800000, taxRate: 0 },
  //   {
  //     id: 9,
  //     orderId: 2,
  //     lowerLimit: 1800000,
  //     upperLimit: 2800000,
  //     taxRate: 6
  //   },
  //   {
  //     id: 10,
  //     orderId: 3,
  //     lowerLimit: 2800000,
  //     upperLimit: 3300000,
  //     taxRate: 18
  //   },
  //   {
  //     id: 11,
  //     orderId: 4,
  //     lowerLimit: 3300000,
  //     upperLimit: 3800000,
  //     taxRate: 24
  //   },
  //   {
  //     id: 12,
  //     orderId: 5,
  //     lowerLimit: 3800000,
  //     upperLimit: 4300000,
  //     taxRate: 30
  //   },
  //   {
  //     id: 13,
  //     orderId: 6,
  //     lowerLimit: 4300000,
  //     upperLimit: 99999999999,
  //     taxRate: 36
  //   }
  // ],369556)


