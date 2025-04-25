import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BudgetService {
    constructor(private readonly database: DatabaseService) {}
    
    async getBudgets() {
        return this.database.budget.findMany({
        select: {
            id: true,
            budgetDate: true,
            budgetAmount: true,
        },
        });
    }
    
    async createBudget(data: Prisma.BudgetCreateInput) {
        try {
        return await this.database.budget.create({
            data,
        });
        } catch (error) {
        throw new HttpException('Error creating budget', HttpStatus.BAD_REQUEST);
        }
    }
    
    async updateBudget(id: number, data: Prisma.BudgetUpdateInput) {
        try {
        return await this.database.budget.update({
            where: { id },
            data,
        });
        } catch (error) {
        throw new HttpException('Error updating budget', HttpStatus.BAD_REQUEST);
        }
    }
    
    async deleteBudget(id: number) {
        try {
        return await this.database.budget.delete({
            where: { id },
        });
        } catch (error) {
        throw new HttpException('Error deleting budget', HttpStatus.BAD_REQUEST);
        }
    }
}