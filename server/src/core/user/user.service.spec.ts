import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DatabaseService } from '../../database/database.service';
import { HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('UserService', () => {
  let userService: UserService;
  let databaseService: DatabaseService;
const userDto: Prisma.UserCreateInput = {
    id: '1',
    empNo: 'EMP001',
    name: 'Alice Johnson',
    role: 'admin',
    dob: '1990-05-14',
    telephone: '1234567890',
    address: '123 Main St, NY',
    email: 'alice@example.com',
    gender: 'Female',
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
  const mockDatabaseService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),  
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

      mockDatabaseService.user.create.mockResolvedValue(userDto);

      await expect(userService.create(userDto)).resolves.not.toThrow();
      expect(mockDatabaseService.user.create).toHaveBeenCalledWith({
        data: userDto,
      });
    });
    it('should throw conflict error if user ID or Name is not unique', async () => {
      mockDatabaseService.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        userService.create(userDto),
      ).rejects.toThrow(HttpException);
      expect(mockDatabaseService.user.create).toHaveBeenCalled();
    });
  });

  describe('Passkey Generation Test Cases', () => {
    describe('create - Normal Scenario', () => {
      it('should generate unique random passkey for each user registration', async () => {
        // Test Case: Normal Scenario
        // Expected: System generates unique random passkey for each user registration
        const createDto = { ...userDto };
        delete createDto.passkey; // Remove passkey to test generation

        // Mock that no existing user has the generated passkey
        mockDatabaseService.user.findFirst.mockResolvedValue(null);
        mockDatabaseService.user.create.mockResolvedValue({ ...createDto, passkey: 123456 });

        const result = await userService.create(createDto);

        expect(result).toBeDefined();
        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThanOrEqual(100000);
        expect(result).toBeLessThanOrEqual(999999);
        expect(mockDatabaseService.user.findFirst).toHaveBeenCalled();
      });

      it('should generate different passkeys for multiple users', async () => {
        const user1 = { ...userDto, id: '1', passkey: undefined };
        const user2 = { ...userDto, id: '2', passkey: undefined };
        
        // Mock different generated passkeys
        mockDatabaseService.user.findFirst
          .mockResolvedValueOnce(null) // First passkey is unique
          .mockResolvedValueOnce(null); // Second passkey is unique
        
        mockDatabaseService.user.create
          .mockResolvedValueOnce({ ...user1, passkey: 123456 })
          .mockResolvedValueOnce({ ...user2, passkey: 654321 });

        const passkey1 = await userService.create(user1);
        const passkey2 = await userService.create(user2);

        expect(passkey1).not.toBe(passkey2);
        expect(passkey1).toBeGreaterThanOrEqual(100000);
        expect(passkey2).toBeGreaterThanOrEqual(100000);
      });

      it('should retry passkey generation if duplicate found (Duplicate Passkey Prevention)', async () => {
        // Test Case: Duplicate Passkey Prevention
        // Expected: Each user should receive unique passkey with no duplicates
        const createDto = { ...userDto, passkey: undefined };

        // Mock first generated passkey already exists, second one is unique
        mockDatabaseService.user.findFirst
          .mockResolvedValueOnce({ id: 'existing', passkey: 123456 }) // Duplicate found
          .mockResolvedValueOnce(null); // Unique passkey found

        mockDatabaseService.user.create.mockResolvedValue({ ...createDto, passkey: 654321 });

        const result = await userService.create(createDto);

        expect(result).toBeDefined();
        expect(mockDatabaseService.user.findFirst).toHaveBeenCalledTimes(2);
      });

      it('should handle required field validation', async () => {
        const invalidDto = { ...userDto, id: null };

        await expect(userService.create(invalidDto)).rejects.toThrow(
          'Id, Name, Email must be filled'
        );
      });
    });

    describe('regeneratePasskey', () => {
      it('should regenerate unique passkey for existing user', async () => {
        const userId = '1';
        const existingUser = { ...userDto, id: userId };

        mockDatabaseService.user.findUnique.mockResolvedValue(existingUser);
        mockDatabaseService.user.findFirst.mockResolvedValue(null); // New passkey is unique
        mockDatabaseService.user.update.mockResolvedValue({ ...existingUser, passkey: 789012 });

        const newPasskey = await userService.regeneratePasskey(userId);

        expect(newPasskey).toBeDefined();
        expect(typeof newPasskey).toBe('number');
        expect(newPasskey).toBeGreaterThanOrEqual(100000);
        expect(newPasskey).toBeLessThanOrEqual(999999);
        expect(mockDatabaseService.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { passkey: newPasskey },
        });
      });

      it('should ensure regenerated passkey is unique', async () => {
        const userId = '1';
        const existingUser = { ...userDto, id: userId };

        mockDatabaseService.user.findUnique.mockResolvedValue(existingUser);
        // Mock first generated passkey already exists, second one is unique
        mockDatabaseService.user.findFirst
          .mockResolvedValueOnce({ id: 'other', passkey: 111111 }) // Duplicate found
          .mockResolvedValueOnce(null); // Unique passkey found
        mockDatabaseService.user.update.mockResolvedValue({ ...existingUser, passkey: 222222 });

        const newPasskey = await userService.regeneratePasskey(userId);

        expect(newPasskey).toBeDefined();
        expect(mockDatabaseService.user.findFirst).toHaveBeenCalledTimes(2);
      });

      it('should throw error if user not found during regeneration', async () => {
        const userId = 'nonexistent';

        mockDatabaseService.user.findUnique.mockResolvedValue(null);

        await expect(userService.regeneratePasskey(userId)).rejects.toThrow('User Not found');
      });
    });

    describe('findByPasskey', () => {
      it('should find user by valid passkey (Passkey Validation)', async () => {
        // Test Case: Passkey Validation
        // Expected: Use generated passkey for fingerprint device registration
        // Expected: Passkey should be accepted and allow biometric registration
        const passkey = 123456;
        const expectedUser = {
          id: userDto.id,
          name: userDto.name,
          gender: userDto.gender,
          organizationId: 'org123',
        };

        mockDatabaseService.user.findFirst.mockResolvedValue(expectedUser);

        const result = await userService.findByPasskey(passkey);

        expect(result).toEqual(expectedUser);
        expect(mockDatabaseService.user.findFirst).toHaveBeenCalledWith({
          where: { passkey },
          select: {
            id: true,
            name: true,
            gender: true,
            organizationId: true,
          },
        });
      });

      it('should throw error when passkey not found', async () => {
        const invalidPasskey = 999999;

        mockDatabaseService.user.findFirst.mockResolvedValue(null);

        await expect(userService.findByPasskey(invalidPasskey)).rejects.toThrow('User Not found');
      });

      it('should handle multiple passkey validations correctly', async () => {
        const validPasskeys = [123456, 654321, 111111];
        const users = validPasskeys.map((passkey, index) => ({
          id: `user${index + 1}`,
          name: `User ${index + 1}`,
          gender: 'male',
          organizationId: 'org123',
          passkey,
        }));

        for (let i = 0; i < validPasskeys.length; i++) {
          mockDatabaseService.user.findFirst.mockResolvedValueOnce(users[i]);
          
          const result = await userService.findByPasskey(validPasskeys[i]);
          
          expect(result.id).toBe(users[i].id);
          expect(result.name).toBe(users[i].name);
        }
      });
    });
  });

  describe('Passkey System Integration Tests', () => {
    it('should demonstrate complete passkey workflow', async () => {
      // Step 1: Create user with generated passkey
      const createDto = { ...userDto, passkey: undefined };
      mockDatabaseService.user.findFirst.mockResolvedValue(null);
      mockDatabaseService.user.create.mockResolvedValue({ ...createDto, passkey: 123456 });
      
      const generatedPasskey = await userService.create(createDto);
      expect(generatedPasskey).toBeDefined();
      
      // Step 2: Validate the generated passkey can be used to find the user
      const userWithPasskey = { ...userDto, passkey: generatedPasskey };
      mockDatabaseService.user.findFirst.mockResolvedValue(userWithPasskey);
      
      const foundUser = await userService.findByPasskey(generatedPasskey);
      expect(foundUser).toBeTruthy();
      
      // Step 3: Regenerate passkey for the user
      mockDatabaseService.user.findUnique.mockResolvedValue(userWithPasskey);
      mockDatabaseService.user.findFirst.mockResolvedValue(null); // New passkey is unique
      mockDatabaseService.user.update.mockResolvedValue({ ...userWithPasskey, passkey: 789012 });
      
      const newPasskey = await userService.regeneratePasskey(userDto.id);
      expect(newPasskey).not.toBe(generatedPasskey);
      expect(newPasskey).toBeGreaterThanOrEqual(100000);
    });

    it('should handle simultaneous user registrations with unique passkeys', async () => {
      const users = [
        { ...userDto, id: '1', email: 'user1@test.com', passkey: undefined },
        { ...userDto, id: '2', email: 'user2@test.com', passkey: undefined },
        { ...userDto, id: '3', email: 'user3@test.com', passkey: undefined },
      ];

      const generatedPasskeys = [];

      for (let i = 0; i < users.length; i++) {
        // Mock unique passkey generation for each user
        mockDatabaseService.user.findFirst.mockResolvedValue(null);
        mockDatabaseService.user.create.mockResolvedValue({ 
          ...users[i], 
          passkey: 100000 + i * 111111 
        });

        const passkey = await userService.create(users[i]);
        generatedPasskeys.push(passkey);
      }

      // Verify all generated passkeys are unique
      const uniquePasskeys = new Set(generatedPasskeys);
      expect(uniquePasskeys.size).toBe(generatedPasskeys.length);
    });
  });

  describe('findAll',()=>{
    it('should return array of users',async()=>{

        mockDatabaseService.user.findMany.mockResolvedValue(userDto);

        await expect(userService.findAll()).resolves.toEqual(userDto);
        expect (mockDatabaseService.user.findMany).toHaveBeenCalled();
    })
    it('should throw an error if no users are found', async () => {
        mockDatabaseService.user.findMany.mockResolvedValue(null);
  
        await expect(userService.findAll()).rejects.toThrow('No Users');
      });
  })

  describe('findOne', () => {
    it('should return a user by ID', async () => {

      mockDatabaseService.user.findUnique.mockResolvedValue(userDto);

      await expect(userService.findOne('1')).resolves.toEqual(userDto);
    });

    it('should throw an error if user is not found', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(userService.findOne('2')).rejects.toThrow('User Not found');
    });
  });

  describe('update', () => {
    it('should update a user if found', async () => {

      const updateData: Prisma.UserUpdateInput = { name: 'Jane Doe' };

      mockDatabaseService.user.findUnique.mockResolvedValue(userDto);
      mockDatabaseService.user.update.mockResolvedValue({ ...userDto, ...updateData });

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

      mockDatabaseService.user.findUnique.mockResolvedValue(userDto);
      mockDatabaseService.user.delete.mockResolvedValue(userDto);

      await expect(userService.delete('1')).resolves.not.toThrow();
      expect(mockDatabaseService.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw an error if user is not found', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(userService.delete('2')).rejects.toThrow('User Not found');
    });
  });



});
