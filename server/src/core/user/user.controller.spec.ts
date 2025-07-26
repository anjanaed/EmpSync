import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const userDto: Prisma.UserCreateInput = {
    id: '1',
    empNo: 'EMP001',
    name: 'Alice Johnson',
    role: 'admin',
    dob: '1990-05-14',
    telephone: '1234567890',
    address: '123 Main St, NY',
    email: 'alice@example.com',
    gender: 'female',
    salary: 50000,
    passkey: 123456,
    supId: 'sup123',
    language: 'English',
    height: 160,
    weight: 60,
    payrolls: {
      create: [],
    },
    organization: {
      connect: { id: 'org123' },
    },
    permissions: {
      create: [],
    },
  };

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      mockUserService.create.mockResolvedValue(userDto);

      await expect(userController.create(userDto)).resolves.toEqual('User Registered Successfully');
      expect(mockUserService.create).toHaveBeenCalledWith(userDto);
    });

    it('should throw an error if user creation fails', async () => {
      mockUserService.create.mockRejectedValue(
        new HttpException('Bad Request', HttpStatus.BAD_REQUEST),
      );

      await expect(userController.create(userDto)).rejects.toThrow(HttpException);
      expect(mockUserService.create).toHaveBeenCalledWith(userDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUserService.findAll.mockResolvedValue([userDto]);

      await expect(userController.findAll()).resolves.toEqual([userDto]);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });

    it('should throw an error if findAll fails', async () => {
      mockUserService.findAll.mockRejectedValue(
        new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR),
      );

      await expect(userController.findAll()).rejects.toThrow(HttpException);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      mockUserService.findOne.mockResolvedValue(userDto);

      await expect(userController.findOne('1')).resolves.toEqual(userDto);
      expect(mockUserService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw an error if user not found', async () => {
      mockUserService.findOne.mockRejectedValue(
        new HttpException('Not Found', HttpStatus.NOT_FOUND),
      );

      await expect(userController.findOne('2')).rejects.toThrow(HttpException);
      expect(mockUserService.findOne).toHaveBeenCalledWith('2');
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateDto: Prisma.UserUpdateInput = { name: 'Jane Doe' };
      mockUserService.update.mockResolvedValue({ ...userDto, ...updateDto });

      await expect(userController.update('1', updateDto)).resolves.toEqual('User Updated');
      expect(mockUserService.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw an error if user update fails', async () => {
      const updateDto: Prisma.UserUpdateInput = { name: 'Jane Doe' };
      mockUserService.update.mockRejectedValue(
        new HttpException('Bad Request', HttpStatus.BAD_REQUEST),
      );

      await expect(userController.update('2', updateDto)).rejects.toThrow(HttpException);
      expect(mockUserService.update).toHaveBeenCalledWith('2', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      mockUserService.delete.mockResolvedValue({ id: '1' });

      await expect(userController.delete('1')).resolves.toEqual('User Deleted');
      expect(mockUserService.delete).toHaveBeenCalledWith('1');
    });

    it('should throw an error if user deletion fails', async () => {
      mockUserService.delete.mockRejectedValue(
        new HttpException('Not Found', HttpStatus.NOT_FOUND),
      );

      await expect(userController.delete('2')).rejects.toThrow(HttpException);
      expect(mockUserService.delete).toHaveBeenCalledWith('2');
    });
  });
});
