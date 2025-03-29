import { Ingredient } from '@prisma/client';

export interface Order extends Ingredient {
  orderedQuantity: number;
  totalCost: number;
  percentageFulfilled: number;
}

export interface PriorityResult {
  label: string;
  allocated: number;
  used: number;
  utilizationPercentage: number;
  orders: Order[];
}

export interface OrderResponse {
  totalBudget: number;
  budgetAllocation: {
    highPriority: PriorityResult;
    mediumPriority: PriorityResult;
    lowPriority: PriorityResult;
  };
  finalOrders: Order[];
  overallBudgetUtilization: number;
}