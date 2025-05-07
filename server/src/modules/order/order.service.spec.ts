import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './order.service';
import { DatabaseService } from '../../database/database.service';
import { HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let databaseService: DatabaseService;
  const mockDatabaseService = {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const dto: Prisma.OrderCreateInput = {
        orderNumber: '12345',
        orderDate: new Date(),
        price: 100.0,
        employeeId: '1',
        serve: false,
      };
      mockDatabaseService.order.create.mockResolvedValue(dto);

      await expect(ordersService.create(dto)).resolves.not.toThrow();
      expect(mockDatabaseService.order.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it('should throw conflict error if order number is not unique', async () => {
      mockDatabaseService.order.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        ordersService.create({
          orderNumber: '12345',
          orderDate: new Date(),
          price: 100.0,
          employeeId: '1',
          serve: false,
        }),
      ).rejects.toThrow(HttpException);
      expect(mockDatabaseService.order.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of orders', async () => {
      const mockOrders = [
        {
          id: 1,
          orderNumber: '12345',
          orderDate: new Date(),
          price: 100.0,
          employeeId: '1',
          serve: false,
        },
      ];
      mockDatabaseService.order.findMany.mockResolvedValue(mockOrders);

      await expect(ordersService.findAll()).resolves.toEqual(mockOrders);
      expect(mockDatabaseService.order.findMany).toHaveBeenCalled();
    });

    it('should throw an error if no orders are found', async () => {
      mockDatabaseService.order.findMany.mockResolvedValue(null);

      await expect(ordersService.findAll()).rejects.toThrow('No Orders Found');
    });
  });

  describe('findOne', () => {
    it('should return an order by ID', async () => {
      const mockOrder = {
        id: 1,
        orderNumber: '12345',
        orderDate: new Date(),
        price: 100.0,
        employeeId: '1',
        serve: false,
      };
      mockDatabaseService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(ordersService.findOne(1)).resolves.toEqual(mockOrder);
    });

    it('should throw an error if order is not found', async () => {
      mockDatabaseService.order.findUnique.mockResolvedValue(null);

      await expect(ordersService.findOne(2)).rejects.toThrow('Order Not Found');
    });
  });

  describe('update', () => {
    it('should update an order if found', async () => {
      const mockOrder = {
        id: 1,
        orderNumber: '12345',
        orderDate: new Date(),
        price: 100.0,
        employeeId: '1',
        serve: false,
      };
      const updateData: Prisma.OrderUpdateInput = { price: 150.0 };

      mockDatabaseService.order.findUnique.mockResolvedValue(mockOrder);
      mockDatabaseService.order.update.mockResolvedValue({ ...mockOrder, ...updateData });

      await expect(ordersService.update(1, updateData)).resolves.not.toThrow();
      expect(mockDatabaseService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it('should throw an error if order is not found', async () => {
      mockDatabaseService.order.findUnique.mockResolvedValue(null);

      await expect(ordersService.update(2, { price: 150.0 })).rejects.toThrow('Order Not Found');
    });
  });

  describe('delete', () => {
    it('should delete an order if found', async () => {
      const mockOrder = {
        id: 1,
        orderNumber: '12345',
        orderDate: new Date(),
        price: 100.0,
        employeeId: '1',
        serve: false,
      };
      mockDatabaseService.order.findUnique.mockResolvedValue(mockOrder);
      mockDatabaseService.order.delete.mockResolvedValue(mockOrder);

      await expect(ordersService.remove(1)).resolves.not.toThrow();
      expect(mockDatabaseService.order.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw an error if order is not found', async () => {
      mockDatabaseService.order.findUnique.mockResolvedValue(null);

      await expect(ordersService.remove(2)).rejects.toThrow('Order Not Found');
    });
  });
});
