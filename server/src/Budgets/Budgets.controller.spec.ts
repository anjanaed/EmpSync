import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsController } from './Budgets.controller';
import { BudgetService } from './Budgets.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('BudgetsController', () => {
    let controller: BudgetsController;
    let service: BudgetService;

    const mockBudget = {
        id: 1,
        name: 'Test Budget',
        budgetAmount: 5000,
        budgetDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockBudgetService = {
        getAllBudgets: jest.fn(),
        getBudget: jest.fn(),
        createBudget: jest.fn(),
        updateBudget: jest.fn(),
        deleteBudget: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BudgetsController],
            providers: [
                {
                    provide: BudgetService,
                    useValue: mockBudgetService,
                },
            ],
        }).compile();

        controller = module.get<BudgetsController>(BudgetsController);
        service = module.get<BudgetService>(BudgetService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getBudgets', () => {
        it('should return an array of budgets', async () => {
            mockBudgetService.getAllBudgets.mockResolvedValue([mockBudget]);

            const result = await controller.getBudgets();

            expect(result).toEqual([mockBudget]);
            expect(mockBudgetService.getAllBudgets).toHaveBeenCalled();
        });

        it('should throw an error if service fails', async () => {
            mockBudgetService.getAllBudgets.mockRejectedValue(new Error());

            await expect(controller.getBudgets()).rejects.toThrow(
                new HttpException('Failed to fetch budgets', HttpStatus.INTERNAL_SERVER_ERROR)
            );
        });
    });

    describe('getBudget', () => {
        it('should return budget existence status', async () => {
            mockBudgetService.getBudget.mockResolvedValue(true);

            const result = await controller.getBudget('1');

            expect(result).toEqual({ exists: true });
            expect(mockBudgetService.getBudget).toHaveBeenCalledWith(1);
        });

        it('should throw an error if fetch fails', async () => {
            mockBudgetService.getBudget.mockRejectedValue(new Error());

            await expect(controller.getBudget('1')).rejects.toThrow(
                new HttpException('Failed to fetch budget', HttpStatus.INTERNAL_SERVER_ERROR)
            );
        });
    });

    describe('createBudget', () => {
        const createDto: Prisma.BudgetCreateInput = {
            id: 1,
            name: 'Test Budget',
            budgetAmount: 5000,
            budgetDate: new Date(),
        };

        it('should create a new budget', async () => {
            mockBudgetService.createBudget.mockResolvedValue(mockBudget);

            const result = await controller.createBudget(createDto);

            expect(result).toEqual(mockBudget);
            expect(mockBudgetService.createBudget).toHaveBeenCalledWith(createDto);
        });

        it('should throw an error if creation fails', async () => {
            mockBudgetService.createBudget.mockRejectedValue(new Error());

            await expect(controller.createBudget(createDto)).rejects.toThrow(
                new HttpException('Failed to create budget', HttpStatus.BAD_REQUEST)
            );
        });
    });

    describe('updateBudget', () => {
        const updateDto: Prisma.BudgetUpdateInput = {
            budgetAmount: 6000,
        };

        it('should update a budget', async () => {
            mockBudgetService.updateBudget.mockResolvedValue({ ...mockBudget, ...updateDto });

            const result = await controller.updateBudget('1', updateDto);

            expect(result).toEqual({ ...mockBudget, ...updateDto });
            expect(mockBudgetService.updateBudget).toHaveBeenCalledWith(1, updateDto);
        });

        it('should throw an error if update fails', async () => {
            mockBudgetService.updateBudget.mockRejectedValue(new Error());

            await expect(controller.updateBudget('1', updateDto)).rejects.toThrow(
                new HttpException('Failed to update budget', HttpStatus.BAD_REQUEST)
            );
        });
    });

    describe('deleteBudget', () => {
        it('should delete a budget', async () => {
            mockBudgetService.deleteBudget.mockResolvedValue(mockBudget);

            const result = await controller.deleteBudget('1');

            expect(result).toEqual(mockBudget);
            expect(mockBudgetService.deleteBudget).toHaveBeenCalledWith(1);
        });

        it('should throw an error if deletion fails', async () => {
            mockBudgetService.deleteBudget.mockRejectedValue(new Error());

            await expect(controller.deleteBudget('1')).rejects.toThrow(
                new HttpException('Failed to delete budget', HttpStatus.BAD_REQUEST)
            );
        });
    });
});