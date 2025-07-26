import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../../src/modules/order/order.controller';
import { OrdersService } from '../../src/modules/order/order.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../src/core/authentication/roles.guard';

describe('User Portal - Meal Pre-ordering Service', () => {
  let orderController: OrdersController;
  let orderService: OrdersService;

  const mockOrderService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrderService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    orderController = module.get<OrdersController>(OrdersController);
    orderService = module.get<OrdersService>(OrdersService);
  });

  describe('Test Case 8: Meal Pre-ordering for Future Dates', () => {
    it('should successfully place meal order for tomorrow', async () => {
      // Arrange
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const futureOrderData = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:2', '2:1'], // mealId:quantity format
        orderDate: tomorrow.toISOString(),
        mealTypeId: 1, // Breakfast
        price: 450,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      const expectedOrderResponse = {
        id: 'ORD001',
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:2', '2:1'],
        orderDate: tomorrow.toISOString(),
        mealTypeId: 1,
        price: 450,
        serve: false,
        createdAt: new Date().toISOString(),
      };

      mockOrderService.create.mockResolvedValue(expectedOrderResponse);

      // Act
      const result = await orderController.create(futureOrderData);

      // Assert
      expect(orderService.create).toHaveBeenCalledWith(futureOrderData);
      expect(result).toEqual(expectedOrderResponse);
      expect(result.id).toBe('ORD001');
      expect(result.serve).toBe(false);
      expect(new Date(result.orderDate)).toEqual(tomorrow);
    });

    it('should allow ordering meals for next week', async () => {
      // Arrange
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const weeklyOrderData = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['3:1', '4:1'], // Lunch items
        orderDate: nextWeek.toISOString(),
        mealTypeId: 2, // Lunch
        price: 650,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      const expectedWeeklyOrder = {
        id: 'ORD002',
        ...weeklyOrderData,
        createdAt: new Date().toISOString(),
      };

      mockOrderService.create.mockResolvedValue(expectedWeeklyOrder);

      // Act
      const result = await orderController.create(weeklyOrderData);

      // Assert
      expect(orderService.create).toHaveBeenCalledWith(weeklyOrderData);
      expect(result.mealTypeId).toBe(2);
      expect(new Date(result.orderDate).getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should handle multiple meal items in single future order', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      
      const multiMealOrderData = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1', '2:2', '3:1'], // Multiple items with quantities
        orderDate: futureDate.toISOString(),
        mealTypeId: 1,
        price: 950,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      const expectedMultiMealOrder = {
        id: 'ORD003',
        ...multiMealOrderData,
        createdAt: new Date().toISOString(),
      };

      mockOrderService.create.mockResolvedValue(expectedMultiMealOrder);

      // Act
      const result = await orderController.create(multiMealOrderData);

      // Assert
      expect(result.meals).toEqual(['1:1', '2:2', '3:1']);
      expect(result.price).toBe(950);
    });

    it('should validate future date is not too far in advance', async () => {
      // Arrange
      const tooFarFuture = new Date();
      tooFarFuture.setDate(tooFarFuture.getDate() + 30); // 30 days ahead
      
      const invalidFutureOrderData = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1'],
        orderDate: tooFarFuture.toISOString(),
        mealTypeId: 1,
        price: 200,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      mockOrderService.create.mockRejectedValue(
        new Error('Cannot place orders more than 14 days in advance')
      );

      // Act & Assert
      await expect(orderController.create(invalidFutureOrderData)).rejects.toThrow(
        HttpException
      );
    });
  });

  describe('Test Case 9: Meal Pre-ordering for Past Dates', () => {
    it('should reject meal order for yesterday', async () => {
      // Arrange
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const pastOrderData = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1'],
        orderDate: yesterday.toISOString(),
        mealTypeId: 1,
        price: 200,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      mockOrderService.create.mockRejectedValue(
        new Error('Cannot place orders for past dates')
      );

      // Act & Assert
      await expect(orderController.create(pastOrderData)).rejects.toThrow(
        HttpException
      );
      expect(orderService.create).toHaveBeenCalledWith(pastOrderData);
    });

    it('should return "Invalid date" for last week order attempt', async () => {
      // Arrange
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const pastWeekOrderData = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['2:1'],
        orderDate: lastWeek.toISOString(),
        mealTypeId: 2,
        price: 300,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      mockOrderService.create.mockRejectedValue(
        new Error('Invalid date: Cannot order meals for past dates')
      );

      // Act & Assert
      await expect(orderController.create(pastWeekOrderData)).rejects.toThrow(
        HttpException
      );
    });

    it('should handle same-day order based on meal time cutoff', async () => {
      // Arrange
      const today = new Date();
      today.setHours(10, 0, 0, 0); // 10:00 AM
      
      const sameDayOrderData = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['3:1'], // Lunch order
        orderDate: today.toISOString(),
        mealTypeId: 2, // Lunch (cutoff at 11:00 AM)
        price: 350,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      // Mock successful order (before cutoff time)
      const expectedSameDayOrder = {
        id: 'ORD004',
        ...sameDayOrderData,
        createdAt: new Date().toISOString(),
      };

      mockOrderService.create.mockResolvedValue(expectedSameDayOrder);

      // Act
      const result = await orderController.create(sameDayOrderData);

      // Assert
      expect(result.id).toBe('ORD004');
      expect(result.mealTypeId).toBe(2);
    });

    it('should reject same-day order after meal time cutoff', async () => {
      // Arrange
      const today = new Date();
      today.setHours(12, 0, 0, 0); // 12:00 PM (after lunch cutoff)
      
      const lateSameDayOrderData = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['3:1'],
        orderDate: today.toISOString(),
        mealTypeId: 2, // Lunch
        price: 350,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      mockOrderService.create.mockRejectedValue(
        new Error('Order deadline has passed for today\'s lunch')
      );

      // Act & Assert
      await expect(orderController.create(lateSameDayOrderData)).rejects.toThrow(
        HttpException
      );
    });

    it('should validate order date format', async () => {
      // Arrange
      const invalidDateOrderData = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1'],
        orderDate: 'invalid-date-format',
        mealTypeId: 1,
        price: 200,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      mockOrderService.create.mockRejectedValue(
        new Error('Invalid date format')
      );

      // Act & Assert
      await expect(orderController.create(invalidDateOrderData)).rejects.toThrow(
        HttpException
      );
    });

    it('should handle edge case for midnight order placement', async () => {
      // Arrange
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      
      const midnightOrderData = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1'],
        orderDate: midnight.toISOString(),
        mealTypeId: 1, // Breakfast
        price: 200,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      // Should allow breakfast orders at midnight for same day
      const expectedMidnightOrder = {
        id: 'ORD005',
        ...midnightOrderData,
        createdAt: new Date().toISOString(),
      };

      mockOrderService.create.mockResolvedValue(expectedMidnightOrder);

      // Act
      const result = await orderController.create(midnightOrderData);

      // Assert
      expect(result.id).toBe('ORD005');
      expect(result.mealTypeId).toBe(1);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
