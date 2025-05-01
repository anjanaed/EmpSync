import { Test, TestingModule } from '@nestjs/testing';
import { BudgetService } from './Budgets.service';
import { DatabaseService } from '../database/database.service';
import { HttpException } from '@nestjs/common';

describe('BudgetService', () => {
    let service: BudgetService;
    let databaseService: DatabaseService;

    const mockDatabaseService = {
        budget: {
            findMany: jest.fn(),
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

    describe('getBudgets', () => {
        it('should return all budgets', async () => {
            const mockBudgets = [
                { id: 1, budgetDate: new Date(), budgetAmount: 1000 }
            ];
            mockDatabaseService.budget.findMany.mockResolvedValue(mockBudgets);
            
            const result = await service.getBudgets();
            expect(result).toEqual(mockBudgets);
        });
    });

    describe('createBudget', () => {
        it('should create a budget', async () => {
            const budgetData = { budgetDate: new Date(), budgetAmount: 1000 };
            mockDatabaseService.budget.create.mockResolvedValue(budgetData);
            
            const result = await service.createBudget(budgetData);
            expect(result).toEqual(budgetData);
        });

        it('should throw error if creation fails', async () => {
            mockDatabaseService.budget.create.mockRejectedValue(new Error());
            
            await expect(service.createBudget({
                budgetDate: new Date(),
                budgetAmount: 1000
            })).rejects.toThrow(HttpException);
        });
    });

    describe('updateBudget', () => {
        it('should update a budget', async () => {
            const budgetData = { budgetAmount: 2000 };
            mockDatabaseService.budget.update.mockResolvedValue(budgetData);
            
            const result = await service.updateBudget(1, budgetData);
            expect(result).toEqual(budgetData);
        });

        it('should throw error if update fails', async () => {
            mockDatabaseService.budget.update.mockRejectedValue(new Error());
            
            await expect(service.updateBudget(1, {})).rejects.toThrow(HttpException);
        });
    });

    describe('deleteBudget', () => {
        it('should delete a budget', async () => {
            const mockBudget = { id: 1, budgetDate: new Date(), budgetAmount: 1000 };
            mockDatabaseService.budget.delete.mockResolvedValue(mockBudget);
            
            const result = await service.deleteBudget(1);
            expect(result).toEqual(mockBudget);
        });

        it('should throw error if deletion fails', async () => {
            mockDatabaseService.budget.delete.mockRejectedValue(new Error());
            
            await expect(service.deleteBudget(1)).rejects.toThrow(HttpException);
        });
    });
});