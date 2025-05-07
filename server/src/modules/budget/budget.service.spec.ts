import { Test, TestingModule } from '@nestjs/testing';
import { BudgetService } from './budget.service';
import { DatabaseService } from '../../database/database.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('BudgetService', () => {
    let service: BudgetService;
    let databaseService: DatabaseService;

    const mockDatabaseService = {
        budget: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BudgetService,
                {
                    provide: DatabaseService,
                    useValue: mockDatabaseService
                }
            ],
        }).compile();

        service = module.get<BudgetService>(BudgetService);
        databaseService = module.get<DatabaseService>(DatabaseService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllBudgets', () => {
        it('should return all budgets with selected fields', async () => {
            const mockBudgets = [
                { id: 1, budgetDate: new Date(), budgetAmount: 1000 }
            ];
            mockDatabaseService.budget.findMany.mockResolvedValue(mockBudgets);
            
            const result = await service.getAllBudgets();
            expect(result).toEqual(mockBudgets);
            expect(mockDatabaseService.budget.findMany).toHaveBeenCalledWith({
                select: {
                    id: true,
                    budgetDate: true,
                    budgetAmount: true,
                }
            });
        });
    });

    describe('getBudget', () => {
        it('should return a budget by id', async () => {
            const mockBudget = { id: 1, budgetDate: new Date(), budgetAmount: 1000 };
            mockDatabaseService.budget.findUnique.mockResolvedValue(mockBudget);
            
            const result = await service.getBudget(1);
            expect(result).toEqual(mockBudget);
            expect(mockDatabaseService.budget.findUnique).toHaveBeenCalledWith({
                where: { id: 1 }
            });
        });

        it('should throw NOT_FOUND exception if budget not found', async () => {
            mockDatabaseService.budget.findUnique.mockResolvedValue(null);
            
            await expect(service.getBudget(1)).rejects.toThrow(
                new HttpException('Budget not found', HttpStatus.NOT_FOUND)
            );
        });

        it('should throw INTERNAL_SERVER_ERROR for unexpected errors', async () => {
            mockDatabaseService.budget.findUnique.mockRejectedValue(new Error());
            
            await expect(service.getBudget(1)).rejects.toThrow(
                new HttpException('Error fetching budget', HttpStatus.INTERNAL_SERVER_ERROR)
            );
        });
    });

    describe('createBudget', () => {
        it('should create a budget successfully', async () => {
            const budgetData = {
                id: 1,
                name: 'Test Budget',
                budgetDate: new Date(),
                budgetAmount: 1000
            };
            mockDatabaseService.budget.create.mockResolvedValue(budgetData);
            
            const result = await service.createBudget(budgetData);
            expect(result).toEqual(budgetData);
            expect(mockDatabaseService.budget.create).toHaveBeenCalledWith({
                data: budgetData
            });
        });

        it('should throw BAD_REQUEST if budgetAmount is not a number', async () => {
            const budgetData = {
                id: 1,
                name: 'Test Budget',
                budgetDate: new Date(),
                budgetAmount: '1000' as any
            };
            
            await expect(service.createBudget(budgetData)).rejects.toThrow(
                new HttpException('Budget amount must be greater than 0', HttpStatus.BAD_REQUEST)
            );
        });

        it('should throw BAD_REQUEST if budgetAmount is zero', async () => {
            const budgetData = {
                id: 1,
                name: 'Test Budget',
                budgetDate: new Date(),
                budgetAmount: 0
            };
            
            await expect(service.createBudget(budgetData)).rejects.toThrow(
                new HttpException('Budget amount must be greater than 0', HttpStatus.BAD_REQUEST)
            );
        });

        it('should throw BAD_REQUEST if budgetAmount is negative', async () => {
            const budgetData = {
                id: 1,
                name: 'Test Budget',
                budgetDate: new Date(),
                budgetAmount: -100
            };
            
            await expect(service.createBudget(budgetData)).rejects.toThrow(
                new HttpException('Budget amount must be greater than 0', HttpStatus.BAD_REQUEST)
            );
        });
    });

    describe('updateBudget', () => {
        it('should update a budget successfully', async () => {
            const updateData = { budgetAmount: 2000 };
            const updatedBudget = { id: 1, ...updateData };
            mockDatabaseService.budget.update.mockResolvedValue(updatedBudget);
            
            const result = await service.updateBudget(1, updateData);
            expect(result).toEqual(updatedBudget);
            expect(mockDatabaseService.budget.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData
            });
        });

        it('should throw BAD_REQUEST if update fails', async () => {
            mockDatabaseService.budget.update.mockRejectedValue(new Error());
            
            await expect(service.updateBudget(1, {})).rejects.toThrow(
                new HttpException('Error updating budget', HttpStatus.BAD_REQUEST)
            );
        });
    });

    describe('deleteBudget', () => {
        it('should delete a budget successfully', async () => {
            const mockBudget = { id: 1, budgetDate: new Date(), budgetAmount: 1000 };
            mockDatabaseService.budget.delete.mockResolvedValue(mockBudget);
            
            const result = await service.deleteBudget(1);
            expect(result).toEqual(mockBudget);
            expect(mockDatabaseService.budget.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
        });

        it('should throw BAD_REQUEST if deletion fails', async () => {
            mockDatabaseService.budget.delete.mockRejectedValue(new Error());
            
            await expect(service.deleteBudget(1)).rejects.toThrow(
                new HttpException('Error deleting budget', HttpStatus.BAD_REQUEST)
            );
        });
    });
});