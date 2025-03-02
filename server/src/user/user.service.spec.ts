import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DatabaseService } from '../database/database.service';
import { HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('UserService', () => {
  let userService: UserService;
  let databaseService: DatabaseService;
  const dto: Prisma.UserCreateInput = {
    id: '1',
    name: 'Alice Johnson',
    role: 'admin',
    dob: '1990-05-14',
    telephone: '1234567890',
    address: '123 Main St, NY',
    email: 'alice@example.com',
    password: 'hashedpassword1',
    thumbId: Buffer.from('b3f8a1d2', 'hex'),
  };
  const mockDatabaseService = {
    user: {
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
        UserService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {

      mockDatabaseService.user.create.mockResolvedValue(dto);

      await expect(userService.create(dto)).resolves.not.toThrow();
      expect(mockDatabaseService.user.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
    it('should throw conflict error if user ID or Name is not unique', async () => {
      mockDatabaseService.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        userService.create(dto),
      ).rejects.toThrow(HttpException);
      expect(mockDatabaseService.user.create).toHaveBeenCalled();
    });
  });

  describe('findAll',()=>{
    it('should return array of users',async()=>{

        mockDatabaseService.user.findMany.mockResolvedValue(dto);

        await expect(userService.findAll()).resolves.toEqual(dto);
        expect (mockDatabaseService.user.findMany).toHaveBeenCalled();
    })
    it('should throw an error if no users are found', async () => {
        mockDatabaseService.user.findMany.mockResolvedValue(null);
  
        await expect(userService.findAll()).rejects.toThrow('No Users');
      });
  })

  describe('findOne', () => {
    it('should return a user by ID', async () => {

      mockDatabaseService.user.findUnique.mockResolvedValue(dto);

      await expect(userService.findOne('1')).resolves.toEqual(dto);
    });

    it('should throw an error if user is not found', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(userService.findOne('2')).rejects.toThrow('User Not found');
    });
  });

  describe('update', () => {
    it('should update a user if found', async () => {

      const updateData: Prisma.UserUpdateInput = { name: 'Jane Doe' };

      mockDatabaseService.user.findUnique.mockResolvedValue(dto);
      mockDatabaseService.user.update.mockResolvedValue({ ...dto, ...updateData });

      await expect(userService.update('1', updateData)).resolves.not.toThrow();
      expect(mockDatabaseService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
    });

    it('should throw an error if user is not found', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(userService.update('2', { name: 'Jane Doe' })).rejects.toThrow('User Not found');
    });
  });

  describe('delete', () => {
    it('should delete a user if found', async () => {

      mockDatabaseService.user.findUnique.mockResolvedValue(dto);
      mockDatabaseService.user.delete.mockResolvedValue(dto);

      await expect(userService.delete('1')).resolves.not.toThrow();
      expect(mockDatabaseService.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw an error if user is not found', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(userService.delete('2')).rejects.toThrow('User Not found');
    });
  });



});
