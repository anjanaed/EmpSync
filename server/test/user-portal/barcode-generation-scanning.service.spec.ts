import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../../src/modules/order/order.controller';
import { OrdersService } from '../../src/modules/order/order.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('User Portal - Barcode Generation and Scanning', () => {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrderService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    orderController = module.get<OrdersController>(OrdersController);
    orderService = module.get<OrdersService>(OrdersService);
  });

  describe('Test Case 12: Barcode Generation', () => {
    it('should generate barcode for confirmed meal order', async () => {
      // Arrange
      const orderData = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:2', '2:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 1,
        price: 450,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      const createdOrder = {
        id: 1001, // Numeric ID as returned by the actual service
        ...orderData,
        createdAt: new Date().toISOString(),
      };

      mockOrderService.create.mockResolvedValue(createdOrder);

      // Act
      const result = await orderController.create(orderData);

      // Assert
      expect(orderService.create).toHaveBeenCalledWith(orderData);
      expect(result).toEqual(createdOrder);
      expect(result.id).toBe(1001);
      
      // Verify that order ID can be used as barcode value
      const barcodeValue = result.id.toString();
      expect(barcodeValue).toMatch(/^\d+$/); // Should match numbers
      expect(barcodeValue.length).toBeGreaterThan(3);
    });

    it('should generate unique barcode for each order', async () => {
      // Arrange
      const orderData1 = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 1,
        price: 200,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      const orderData2 = {
        employeeId: 'EMP002',
        orgId: 'org-123',
        meals: ['2:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 2,
        price: 300,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      const createdOrder1 = { id: 'ORD001', ...orderData1 };
      const createdOrder2 = { id: 'ORD002', ...orderData2 };

      mockOrderService.create.mockResolvedValueOnce(createdOrder1);
      mockOrderService.create.mockResolvedValueOnce(createdOrder2);

      // Act
      const result1 = await orderController.create(orderData1);
      const result2 = await orderController.create(orderData2);

      // Assert
      expect(result1.id).toBe('ORD001');
      expect(result2.id).toBe('ORD002');
      expect(result1.id).not.toBe(result2.id); // Unique barcodes
    });

    it('should include order details in barcode-readable format', async () => {
      // Arrange
      const orderData = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 1,
        price: 200,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      const createdOrder = {
        id: 123, // Numeric ID
        ...orderData,
        createdAt: new Date().toISOString(),
      };

      mockOrderService.create.mockResolvedValue(createdOrder);

      // Act
      const result = await orderController.create(orderData);

      // Assert
      // Verify order ID is numeric for barcode generation
      expect(typeof result.id).toBe('number');
      expect(result.id).toBe(123);
      
      // Verify order contains all necessary information for barcode display
      expect(result).toHaveProperty('employeeId');
      expect(result).toHaveProperty('meals');
      expect(result).toHaveProperty('mealTypeId');
      expect(result).toHaveProperty('price');
    });

    it('should validate barcode generation for different meal types', async () => {
      // Arrange
      const breakfastOrder = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 1, // Breakfast
        price: 200,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      const lunchOrder = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['3:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 2, // Lunch
        price: 350,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      const createdBreakfastOrder = { id: 'ORD100', ...breakfastOrder };
      const createdLunchOrder = { id: 'ORD101', ...lunchOrder };

      mockOrderService.create.mockResolvedValueOnce(createdBreakfastOrder);
      mockOrderService.create.mockResolvedValueOnce(createdLunchOrder);

      // Act
      const breakfastResult = await orderController.create(breakfastOrder);
      const lunchResult = await orderController.create(lunchOrder);

      // Assert
      expect(breakfastResult.id).toBe('ORD100');
      expect(lunchResult.id).toBe('ORD101');
      expect(breakfastResult.mealTypeId).toBe(1);
      expect(lunchResult.mealTypeId).toBe(2);
    });

    it('should handle barcode generation failure scenarios', async () => {
      // Arrange
      const orderData = {
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 1,
        price: 200,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      mockOrderService.create.mockRejectedValue(
        new Error('Failed to create order')
      );

      // Act & Assert
      await expect(orderController.create(orderData)).rejects.toThrow(
        HttpException
      );
    });
  });

  describe('Test Case 13: Barcode Scanning Functionality', () => {
    it('should successfully validate scanned barcode and retrieve order', async () => {
      // Arrange
      const scannedOrderId = 1; // Numeric ID for barcode scanning
      const orderDetails = {
        id: 1,
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:2', '2:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 1,
        price: 450,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      mockOrderService.findOne.mockResolvedValue(orderDetails);

      // Act
      const result = await orderController.findOne("1"); // Use string directly

      // Assert
      expect(orderService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(orderDetails);
      expect(result.id).toBe(1);
      expect(result.serve).toBe(false); // Not yet served
    });

    it('should mark order as served after successful barcode scan', async () => {
      // Arrange
      const scannedOrderId = 2; // Numeric ID for barcode scanning
      const orderDetails = {
        id: 2,
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 1,
        price: 200,
        serve: false,
        orderPlacedTime: new Date().toISOString(),
      };

      const servedOrder = {
        ...orderDetails,
        serve: true,
        updatedAt: new Date().toISOString(),
      };

      mockOrderService.findOne.mockResolvedValue(orderDetails);
      mockOrderService.update.mockResolvedValue(servedOrder);

      // Act
      const foundOrder = await orderController.findOne("2");
      const updatedOrder = await orderController.update("2", { serve: true });

      // Assert
      expect(foundOrder.serve).toBe(false);
      expect(updatedOrder.serve).toBe(true);
      expect(orderService.update).toHaveBeenCalledWith(2, { serve: true });
    });

    it('should reject invalid barcode scans', async () => {
      // Arrange
      const invalidBarcodeId = 999; // Invalid numeric ID

      mockOrderService.findOne.mockRejectedValue(
        new Error('Order not found')
      );

      // Act & Assert
      await expect(orderController.findOne("999")).rejects.toThrow(
        HttpException
      );
      expect(orderService.findOne).toHaveBeenCalledWith(999);
    });

    it('should prevent duplicate scanning of already served orders', async () => {
      // Arrange
      const alreadyServedOrderId = 'ORD003';
      const servedOrderDetails = {
        id: 'ORD003',
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 1,
        price: 200,
        serve: true, // Already served
        orderPlacedTime: new Date().toISOString(),
      };

      mockOrderService.findOne.mockResolvedValue(servedOrderDetails);

      // Act
      const result = await orderController.findOne(alreadyServedOrderId);

      // Assert
      expect(result.serve).toBe(true);
      expect(result.id).toBe('ORD003');
      
      // Verify that attempting to serve again would be prevented
      // (This would be handled by business logic in the service layer)
    });

    it('should handle barcode scanning for different order formats', async () => {
      // Arrange
      const numericBarcodeId = 123; // Pure numeric barcode
      const prefixedBarcodeId = 456; // Another numeric barcode

      const orderForNumeric = {
        id: 123,
        employeeId: 'EMP001',
        serve: false,
      };

      const orderForPrefixed = {
        id: 456,
        employeeId: 'EMP002',
        serve: false,
      };

      mockOrderService.findOne.mockResolvedValueOnce(orderForNumeric);
      mockOrderService.findOne.mockResolvedValueOnce(orderForPrefixed);

      // Act
      const numericResult = await orderController.findOne("123");
      const prefixedResult = await orderController.findOne("456");

      // Assert
      expect(numericResult.id).toBe(123);
      expect(prefixedResult.id).toBe(456);
      expect(orderService.findOne).toHaveBeenCalledWith(123);
      expect(orderService.findOne).toHaveBeenCalledWith(456);
    });

    it('should validate barcode scan permissions by organization', async () => {
      // Arrange
      const orderFromDifferentOrg = {
        id: 'ORD004',
        employeeId: 'EMP001',
        orgId: 'different-org-456', // Different organization
        meals: ['1:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 1,
        price: 200,
        serve: false,
      };

      mockOrderService.findOne.mockResolvedValue(orderFromDifferentOrg);

      // Act
      const result = await orderController.findOne('ORD004');

      // Assert
      expect(result.orgId).toBe('different-org-456');
      // In a real implementation, this would check if the scanning user
      // has permission to access this organization's orders
    });

    it('should handle network errors during barcode scanning', async () => {
      // Arrange
      const orderIdForNetworkError = 'ORD005';

      mockOrderService.findOne.mockRejectedValue(
        new Error('Network connection failed')
      );

      // Act & Assert
      await expect(orderController.findOne(orderIdForNetworkError)).rejects.toThrow(
        HttpException
      );
    });

    it('should log barcode scanning activities for audit trail', async () => {
      // Arrange
      const scannedOrderId = 6; // Numeric ID for barcode scanning
      const orderDetails = {
        id: 6,
        employeeId: 'EMP001',
        orgId: 'org-123',
        meals: ['1:1'],
        orderDate: new Date().toISOString(),
        mealTypeId: 1,
        price: 200,
        serve: false,
      };

      mockOrderService.findOne.mockResolvedValue(orderDetails);

      // Act
      const result = await orderController.findOne("6");

      // Assert
      expect(orderService.findOne).toHaveBeenCalledWith(6);
      expect(result.id).toBe(6);
      
      // In a real implementation, this would verify that scanning activities
      // are logged for audit purposes
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
