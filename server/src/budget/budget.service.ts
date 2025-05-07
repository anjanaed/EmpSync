import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BudgetService {
    constructor(private readonly database: DatabaseService) {}
    
    async getAllBudgets() {
        return this.database.budget.findMany({
        select: {
            id: true,
            budgetDate: true,
            budgetAmount: true,
        },
        });
    }
    async getBudget(id: number): Promise<any> {
        try {
            const budget = await this.database.budget.findUnique({
                where: { id },
            });
    
            if (!budget) {
                throw new HttpException('Budget not found', HttpStatus.NOT_FOUND);
            }
    
            return budget; 
        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Error fetching budget', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async createBudget(data: Prisma.BudgetCreateInput) {
        try {
            if (typeof data.budgetAmount !== 'number' || data.budgetAmount <= 0) {
                throw new HttpException('Budget amount must be greater than 0', HttpStatus.BAD_REQUEST);
            }
            
            return await this.database.budget.create({
                data,
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
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