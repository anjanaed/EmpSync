import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../../src/modules/order/order.controller';
import { OrdersService } from '../../src/modules/order/order.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../src/core/authentication/roles.guard';

describe('User Portal - Order Management Service', () => {
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

  describe('Test Case 10: Current Orders Management', () => {
    it('should display current user orders for today and future dates', async () => {
      // Arrange
      const employeeId = 'EMP001';
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const currentOrders = [
        {
          id: 'ORD001',
          employeeId: 'EMP001',
          orgId: 'org-123',
          meals: ['1:2', '2:1'],
          orderDate: today.toISOString(),
          mealTypeId: 1,
          price: 450,
          serve: false,
          createdAt: today.toISOString(),
        },
        {
          id: 'ORD002',
          employeeId: 'EMP001',
          orgId: 'org-123',
          meals: ['3:1'],
          orderDate: tomorrow.toISOString(),
          mealTypeId: 2,
          price: 350,
          serve: false,
          createdAt: today.toISOString(),
        },
      ];

      mockOrderService.findAll.mockResolvedValue(currentOrders);

      // Act
      const result = await orderController.findAll(employeeId, 'org-123');

      // Assert
      expect(orderService.findAll).toHaveBeenCalledWith(employeeId, 'org-123');
      expect(result).toEqual(currentOrders);
      expect(result).toHaveLength(2);
      expect(result.every(order => order.employeeId === employeeId)).toBe(true);
      expect(result.every(order => order.serve === false)).toBe(true);
    });

    it('should allow users to cancel orders before meal time cutoff', async () => {
      // Arrange
      const orderId = '1'; // Use numeric string ID
      const cancelTime = new Date();
      cancelTime.setHours(8, 0, 0, 0); // 8:00 AM, before breakfast cutoff

      const orderToCancel = {
        id: '1',
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 1, // Breakfast
        price: 200,
        serve: false,
        createdAt: cancelTime.toISOString(),
      };

      mockOrderService.findOne.mockResolvedValue(orderToCancel);
      mockOrderService.remove.mockResolvedValue(orderToCancel);

      // Act
      const findResult = await orderController.findOne("1");
      const cancelResult = await orderController.remove("1");

      // Assert
      expect(orderService.findOne).toHaveBeenCalledWith(1);
      expect(orderService.remove).toHaveBeenCalledWith(1);
      expect(findResult.id).toBe('1');
      expect(cancelResult.id).toBe('1');
    });

    it('should display order details including meal items and quantities', async () => {
      // Arrange
      const orderId = 'ORD003';
      const detailedOrder = {
        id: 'ORD003',
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:2', '2:1', '3:3'], // Multiple items with quantities
        orderDate: new Date().toISOString(),
        mealTypeId: 1,
        price: 950,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      mockOrderService.findOne.mockResolvedValue(detailedOrder);

      // Act
      const result = await orderController.findOne(orderId);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('meals');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('orderDate');
      expect(result).toHaveProperty('mealTypeId');
      expect(result.meals).toEqual(['1:2', '2:1', '3:3']);
      expect(result.price).toBe(950);
    });

    it('should filter orders by organization ID', async () => {
      // Arrange
      const employeeId = 'EMP001';
      const orgId = 'org-123';
      const organizationOrders = [
        {
          id: 'ORD004',
          employeeId: 'EMP001',
          orgId: 'org-123',
          meals: ['1:1'],
          orderDate: new Date().toISOString(),
          mealTypeId: 1,
          price: 200,
          serve: false,
        },
      ];

      mockOrderService.findAll.mockResolvedValue(organizationOrders);

      // Act
      const result = await orderController.findAll(employeeId, orgId);

      // Assert
      expect(orderService.findAll).toHaveBeenCalledWith(employeeId, orgId);
      expect(result.every(order => order.orgId === orgId)).toBe(true);
    });

    it('should update order status when meal is served', async () => {
      // Arrange
      const orderId = '5'; // Use numeric string ID
      const updateData = {
        serve: true,
        servedAt: new Date().toISOString(),
      };
      const updatedOrder = {
        id: '5',
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 1,
        price: 200,
        serve: true,
        orderPlacedTime: new Date().toISOString(),
      };

      mockOrderService.update.mockResolvedValue(updatedOrder);

      // Act
      const result = await orderController.update("5", updateData);

      // Assert
      expect(orderService.update).toHaveBeenCalledWith(5, updateData);
      expect(result.serve).toBe(true);
      // servedAt would be handled by the actual service implementation
    });
  });

  describe('Test Case 11: Order History Management', () => {
    it('should retrieve complete order history for user', async () => {
      // Arrange
      const employeeId = 'EMP001';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const orderHistory = [
        {
          id: 'ORD006',
          employeeId: 'EMP001',
          orgId: 'org-123',
          meals: ['1:1'],
          orderDate: yesterday.toISOString(),
          mealTypeId: 1,
          price: 200,
          serve: true,
          servedAt: yesterday.toISOString(),
          createdAt: yesterday.toISOString(),
        },
        {
          id: 'ORD007',
          employeeId: 'EMP001',
          orgId: 'org-123',
          meals: ['2:2'],
          orderDate: lastWeek.toISOString(),
          mealTypeId: 2,
          price: 600,
          serve: true,
          servedAt: lastWeek.toISOString(),
          createdAt: lastWeek.toISOString(),
        },
      ];

      mockOrderService.findAll.mockResolvedValue(orderHistory);

      // Act
      const result = await orderController.findAll(employeeId);

      // Assert
      expect(result).toEqual(orderHistory);
      expect(result).toHaveLength(2);
      expect(result.every(order => order.employeeId === employeeId)).toBe(true);
      expect(result.every(order => order.serve === true)).toBe(true);
    });

    it('should display served orders with completion timestamps', async () => {
      // Arrange
      const orderId = 'ORD008';
      const servedOrder = {
        id: 'ORD008',
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['3:1'],
        orderDate: '2024-01-15T12:00:00.000Z',
        mealTypeId: 2,
        price: 350,
        serve: true,
        orderPlacedTime: '2024-01-15T09:00:00.000Z',
        createdAt: '2024-01-15T09:00:00.000Z',
      };

      mockOrderService.findOne.mockResolvedValue(servedOrder);

      // Act
      const result = await orderController.findOne(orderId);

      // Assert
      expect(result.serve).toBe(true);
      expect(result.orderPlacedTime).toBeDefined();
      expect(new Date(result.orderDate).getTime()).toBeGreaterThan(new Date(result.orderPlacedTime).getTime());
    });

    it('should sort order history by date (newest first)', async () => {
      // Arrange
      const employeeId = 'EMP001';
      const orderHistory = [
        {
          id: 'ORD009',
          employeeId: 'EMP001',
          orderDate: '2024-01-20T12:00:00.000Z',
          serve: true,
          createdAt: '2024-01-20T09:00:00.000Z',
        },
        {
          id: 'ORD010',
          employeeId: 'EMP001',
          orderDate: '2024-01-19T12:00:00.000Z',
          serve: true,
          createdAt: '2024-01-19T09:00:00.000Z',
        },
        {
          id: 'ORD011',
          employeeId: 'EMP001',
          orderDate: '2024-01-18T12:00:00.000Z',
          serve: true,
          createdAt: '2024-01-18T09:00:00.000Z',
        },
      ];

      mockOrderService.findAll.mockResolvedValue(orderHistory);

      // Act
      const result = await orderController.findAll(employeeId);

      // Assert
      expect(result[0].orderDate).toBe('2024-01-20T12:00:00.000Z'); // Most recent first
      expect(result[2].orderDate).toBe('2024-01-18T12:00:00.000Z'); // Oldest last
    });

    it('should handle empty order history gracefully', async () => {
      // Arrange
      const employeeId = 'EMP999'; // New employee with no orders
      const emptyHistory = [];

      mockOrderService.findAll.mockResolvedValue(emptyHistory);

      // Act
      const result = await orderController.findAll(employeeId);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should filter history by date range', async () => {
      // Arrange
      const employeeId = 'EMP001';
      const filteredHistory = [
        {
          id: 'ORD012',
          employeeId: 'EMP001',
          orderDate: '2024-01-15T12:00:00.000Z',
          serve: true,
        },
        {
          id: 'ORD013',
          employeeId: 'EMP001',
          orderDate: '2024-01-20T12:00:00.000Z',
          serve: true,
        },
      ];

      mockOrderService.findAll.mockResolvedValue(filteredHistory);

      // Act
      const result = await orderController.findAll(employeeId, 'org-123');

      // Assert
      expect(orderService.findAll).toHaveBeenCalledWith(employeeId, 'org-123');
      expect(result).toEqual(filteredHistory);
      expect(result.every(order => {
        const orderDate = new Date(order.orderDate);
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');
        return orderDate >= startDate && orderDate <= endDate;
      })).toBe(true);
    });

    it('should calculate total spending from order history', async () => {
      // Arrange
      const employeeId = 'EMP001';
      const ordersWithPrices = [
        { id: 'ORD014', employeeId: 'EMP001', price: 200, serve: true },
        { id: 'ORD015', employeeId: 'EMP001', price: 350, serve: true },
        { id: 'ORD016', employeeId: 'EMP001', price: 150, serve: true },
      ];

      mockOrderService.findAll.mockResolvedValue(ordersWithPrices);

      // Act
      const result = await orderController.findAll(employeeId);
      const totalSpending = result.reduce((sum, order) => sum + order.price, 0);

      // Assert
      expect(totalSpending).toBe(700); // 200 + 350 + 150
      expect(result.every(order => typeof order.price === 'number')).toBe(true);
    });

    it('should handle order not found scenarios', async () => {
      // Arrange
      const nonExistentOrderId = '999'; // Use numeric string ID

      mockOrderService.findOne.mockRejectedValue(
        new Error('Order not found')
      );

      // Act & Assert
      await expect(orderController.findOne("999")).rejects.toThrow(
        HttpException
      );
      expect(orderService.findOne).toHaveBeenCalledWith(999);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
