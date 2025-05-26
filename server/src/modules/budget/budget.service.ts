import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class BudgetService {
    constructor(private readonly database: DatabaseService) {}
    
    async getAllBudgets() {
        return this.database.budget.findMany({
            select: {
                id: true,
                name: true,
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
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Error fetching budget', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async createBudget(data: { name: string; budgetAmount: number }) {
        try {
            // Validate required fields
            if (!data.name || typeof data.name !== 'string') {
                throw new HttpException('Valid budget name is required', HttpStatus.BAD_REQUEST);
            }

            if (!data.budgetAmount || isNaN(data.budgetAmount) || data.budgetAmount <= 0) {
                throw new HttpException('Valid budget amount greater than 0 is required', HttpStatus.BAD_REQUEST);
            }

            const createData = {
                name: data.name,
                budgetAmount: data.budgetAmount,
            };

            const createdBudget = await this.database.budget.create({
                data: createData
            });

            return createdBudget;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            
            if (error?.code === 'P2002') {
                throw new HttpException('Budget with this name already exists', HttpStatus.CONFLICT);
            }

            throw new HttpException(
                'Failed to create budget',
                HttpStatus.BAD_REQUEST
            );
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