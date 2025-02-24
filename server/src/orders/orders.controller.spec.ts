import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Prisma } from '@prisma/client';
import { HttpException } from '@nestjs/common';

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
        orderNumber: '12345',
        orderDate: new Date(),
        price: 100.0,
        employeeId: '1',
        serve: false,
      };
      mockOrdersService.create.mockResolvedValue(dto);

      await expect(controller.create(dto)).resolves.toEqual(dto);
      expect(mockOrdersService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw conflict error if order number is not unique', async () => {
      mockOrdersService.create.mockRejectedValue(new HttpException('Conflict', 409));

      await expect(
        controller.create({
          orderNumber: '12345',
          orderDate: new Date(),
          price: 100.0,
          employeeId: '1',
          serve: false,
        }),
      ).rejects.toThrow(HttpException);
      expect(mockOrdersService.create).toHaveBeenCalled();
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
      mockOrdersService.findAll.mockResolvedValue(mockOrders);

      await expect(controller.findAll()).resolves.toEqual(mockOrders);
      expect(mockOrdersService.findAll).toHaveBeenCalled();
    });

    it('should throw an error if no orders are found', async () => {
      mockOrdersService.findAll.mockRejectedValue(new Error('No Orders'));

      await expect(controller.findAll()).rejects.toThrow('No Orders');
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
      mockOrdersService.findOne.mockResolvedValue(mockOrder);

      await expect(controller.findOne('1')).resolves.toEqual(mockOrder); // Changed ID to string
    });

    it('should throw an error if order is not found', async () => {
      mockOrdersService.findOne.mockRejectedValue(new Error('Order Not found'));

      await expect(controller.findOne('2')).rejects.toThrow('Order Not found'); // Changed ID to string
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

      mockOrdersService.findOne.mockResolvedValue(mockOrder);
      mockOrdersService.update.mockResolvedValue({ ...mockOrder, ...updateData });

      await expect(controller.update('1', updateData)).resolves.toEqual({ ...mockOrder, ...updateData }); // Changed ID to string
      expect(mockOrdersService.update).toHaveBeenCalledWith(1, updateData); // Changed ID to number
    });

    it('should throw an error if order is not found', async () => {
      mockOrdersService.findOne.mockRejectedValue(new Error('Order Not found'));
      mockOrdersService.update.mockRejectedValue(new Error('Order Not found'));

      await expect(controller.update('2', { price: 150.0 })).rejects.toThrow('Order Not found'); // Changed ID to string
    });
  });

  describe('remove', () => { // Changed from delete to remove
    it('should delete an order if found', async () => {
      const mockOrder = {
        id: 1,
        orderNumber: '12345',
        orderDate: new Date(),
        price: 100.0,
        employeeId: '1',
        serve: false,
      };
      mockOrdersService.findOne.mockResolvedValue(mockOrder);
      mockOrdersService.remove.mockResolvedValue(mockOrder);

      await expect(controller.remove('1')).resolves.toEqual(mockOrder); // Changed ID to string
      expect(mockOrdersService.remove).toHaveBeenCalledWith(1); // Changed ID to number
    });

    it('should throw an error if order is not found', async () => {
      mockOrdersService.findOne.mockRejectedValue(new Error('Order Not found'));
      mockOrdersService.remove.mockRejectedValue(new Error('Order Not found'));

      await expect(controller.remove('2')).rejects.toThrow('Order Not found'); // Changed ID to string
    });
  });
});
