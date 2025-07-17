import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';
import { Prisma } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(), 
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const dto: Prisma.OrderCreateInput = {
        orderDate: new Date(),
        price: 100.0,
        employeeId: '1',
        orgId: 'org-1',
        mealTypeId: 1,
        meals: ['meal1', 'meal2'],
        serve: false,
      };
      const mockCreatedOrder = {
        id: 1,
        ...dto,
        orderPlacedTime: new Date(),
      };
      mockOrdersService.create.mockResolvedValue(mockCreatedOrder);

      await expect(controller.create(dto)).resolves.toEqual(mockCreatedOrder);
      expect(mockOrdersService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw bad request error when service throws HttpException', async () => {
      const dto: Prisma.OrderCreateInput = {
        orderDate: new Date(),
        price: 100.0,
        employeeId: '1',
        orgId: 'org-1',
        mealTypeId: 1,
        meals: ['meal1', 'meal2'],
        serve: false,
      };
      mockOrdersService.create.mockRejectedValue(new HttpException('Order Number must be unique', HttpStatus.CONFLICT));

      await expect(controller.create(dto)).rejects.toThrow(HttpException);
      expect(mockOrdersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return array of orders', async () => {
      const mockOrders = [
        {
          id: 1,
          orderDate: new Date(),
          orderPlacedTime: new Date(),
          price: 100.0,
          employeeId: '1',
          orgId: 'org-1',
          mealTypeId: 1,
          meals: ['meal1', 'meal2'],
          serve: false,
        },
      ];
      mockOrdersService.findAll.mockResolvedValue(mockOrders);

      await expect(controller.findAll()).resolves.toEqual(mockOrders);
      expect(mockOrdersService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return array of orders filtered by orgId', async () => {
      const mockOrders = [
        {
          id: 1,
          orderDate: new Date(),
          orderPlacedTime: new Date(),
          price: 100.0,
          employeeId: '1',
          orgId: 'org-1',
          mealTypeId: 1,
          meals: ['meal1', 'meal2'],
          serve: false,
        },
      ];
      mockOrdersService.findAll.mockResolvedValue(mockOrders);

      await expect(controller.findAll('org-1')).resolves.toEqual(mockOrders);
      expect(mockOrdersService.findAll).toHaveBeenCalledWith('org-1');
    });

    it('should return empty array when no orders are found', async () => {
      mockOrdersService.findAll.mockResolvedValue([]);

      await expect(controller.findAll()).resolves.toEqual([]);
      expect(mockOrdersService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should throw an error if service throws HttpException', async () => {
      mockOrdersService.findAll.mockRejectedValue(new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR));

      await expect(controller.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return an order by ID', async () => {
      const mockOrder = {
        id: 1,
        orderDate: new Date(),
        orderPlacedTime: new Date(),
        price: 100.0,
        employeeId: '1',
        orgId: 'org-1',
        mealTypeId: 1,
        meals: ['meal1', 'meal2'],
        serve: false,
      };
      mockOrdersService.findOne.mockResolvedValue(mockOrder);

      await expect(controller.findOne('1')).resolves.toEqual(mockOrder);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw an error if order is not found', async () => {
      mockOrdersService.findOne.mockRejectedValue(new HttpException('Order Not Found', HttpStatus.NOT_FOUND));

      await expect(controller.findOne('2')).rejects.toThrow(HttpException);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(2);
    });
  });

  describe('update', () => {
    it('should update an order if found', async () => {
      const mockOrder = {
        id: 1,
        orderDate: new Date(),
        orderPlacedTime: new Date(),
        price: 100.0,
        employeeId: '1',
        orgId: 'org-1',
        mealTypeId: 1,
        meals: ['meal1', 'meal2'],
        serve: false,
      };
      const updateData: Prisma.OrderUpdateInput = { price: 150.0 };
      const updatedOrder = { ...mockOrder, price: 150.0 };

      mockOrdersService.update.mockResolvedValue(updatedOrder);

      await expect(controller.update('1', updateData)).resolves.toEqual(updatedOrder);
      expect(mockOrdersService.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw an error if order is not found', async () => {
      const updateData: Prisma.OrderUpdateInput = { price: 150.0 };
      mockOrdersService.update.mockRejectedValue(new HttpException('Order Not Found', HttpStatus.NOT_FOUND));

      await expect(controller.update('2', updateData)).rejects.toThrow(HttpException);
      expect(mockOrdersService.update).toHaveBeenCalledWith(2, updateData);
    });
  });

  describe('remove', () => {
    it('should delete an order if found', async () => {
      const mockOrder = {
        id: 1,
        orderDate: new Date(),
        orderPlacedTime: new Date(),
        price: 100.0,
        employeeId: '1',
        orgId: 'org-1',
        mealTypeId: 1,
        meals: ['meal1', 'meal2'],
        serve: false,
      };
      mockOrdersService.remove.mockResolvedValue(mockOrder);

      await expect(controller.remove('1')).resolves.toEqual(mockOrder);
      expect(mockOrdersService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw an error if order is not found', async () => {
      mockOrdersService.remove.mockRejectedValue(new HttpException('Order Not Found', HttpStatus.NOT_FOUND));

      await expect(controller.remove('2')).rejects.toThrow(HttpException);
      expect(mockOrdersService.remove).toHaveBeenCalledWith(2);
    });
  });
});
