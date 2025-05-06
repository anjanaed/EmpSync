import { Body, Controller, Delete, Get, Param, Post, Put, HttpException, HttpStatus, Query } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { BudgetService } from "./Budgets.service";

@Controller('budgets')
export class BudgetsController {
    constructor(private readonly BudgetsService: BudgetService) {}

    @Get()
    async getBudgets() {
        try {
            return await this.BudgetsService.getAllBudgets();
        } catch (error) {
            throw new HttpException('Failed to fetch budgets', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Get(':id')
    async getBudget(@Param('id') id: string) {
        try {
            const budgetExists = await this.BudgetsService.getBudget(Number(id));
            return { exists: budgetExists }; 
        } catch (error) {
            throw new HttpException('Failed to fetch budget', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post()
    async createBudget(@Body() data: Prisma.BudgetCreateInput) {
        try {
            return await this.BudgetsService.createBudget(data);
        } catch (error) {
            throw new HttpException('Failed to create budget', HttpStatus.BAD_REQUEST);
        }
    }

    @Put(':id')
    async updateBudget(
        @Param('id') id: string,
        @Body() data: Prisma.BudgetUpdateInput
    ) {
        try {
            return await this.BudgetsService.updateBudget(Number(id), data);
        } catch (error) {
            throw new HttpException('Failed to update budget', HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':id')
    async deleteBudget(@Param('id') id: string) {
        try {
            return await this.BudgetsService.deleteBudget(Number(id));
        } catch (error) {
            throw new HttpException('Failed to delete budget', HttpStatus.BAD_REQUEST);
        }
    }
}