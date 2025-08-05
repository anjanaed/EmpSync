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

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    regeneratePasskey: jest.fn(),
    findByPasskey: jest.fn(),
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
    it('should create a user successfully and return passkey', async () => {
      const generatedPasskey = 123456;
      mockUserService.create.mockResolvedValue(generatedPasskey);

      const result = await userController.create(userDto);
      
      expect(result).toEqual({ passkey: generatedPasskey });
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

  describe('Passkey Generation Test Cases', () => {
    describe('create - Passkey Generation', () => {
      it('should create user and return generated passkey (Normal Scenario)', async () => {
        // Test Case: Normal Scenario
        // Expected: System generates unique random passkey for each user registration
        const generatedPasskey = 123456;
        mockUserService.create.mockResolvedValue(generatedPasskey);

        const result = await userController.create(userDto);

        expect(result).toEqual({ passkey: generatedPasskey });
        expect(result.passkey).toBeGreaterThanOrEqual(100000);
        expect(result.passkey).toBeLessThanOrEqual(999999);
        expect(mockUserService.create).toHaveBeenCalledWith(userDto);
      });

      it('should handle user creation with passkey generation failure', async () => {
        mockUserService.create.mockRejectedValue(
          new HttpException('Passkey generation failed', HttpStatus.BAD_REQUEST)
        );

        await expect(userController.create(userDto)).rejects.toThrow(HttpException);
      });

      it('should handle multiple user registrations with unique passkeys', async () => {
        const users = [
          { ...userDto, id: '1', email: 'user1@test.com' },
          { ...userDto, id: '2', email: 'user2@test.com' },
          { ...userDto, id: '3', email: 'user3@test.com' },
        ];

        // Mock different passkeys for each user
        const passkeys = [123456, 654321, 111111];
        mockUserService.create
          .mockResolvedValueOnce(passkeys[0])
          .mockResolvedValueOnce(passkeys[1])
          .mockResolvedValueOnce(passkeys[2]);

        const results = [];
        for (let i = 0; i < users.length; i++) {
          const result = await userController.create(users[i]);
          results.push(result);
          expect(result).toEqual({ passkey: passkeys[i] });
          expect(result.passkey).toBeGreaterThanOrEqual(100000);
          expect(result.passkey).toBeLessThanOrEqual(999999);
        }

        // Verify all passkeys are unique
        const uniquePasskeys = new Set(results.map(r => r.passkey));
        expect(uniquePasskeys.size).toBe(3);
        expect(mockUserService.create).toHaveBeenCalledTimes(3);
      });
    });

    describe('regeneratePasskey', () => {
  it('should regenerate passkey for existing user', async () => {
    const userId = '1';
    const newPasskey = 789012;

    mockUserService.regeneratePasskey.mockResolvedValue(newPasskey);

    const result = await userController.regeneratePasskey(userId);

    expect(result).toEqual({ passkey: newPasskey });
    expect(mockUserService.regeneratePasskey).toHaveBeenCalledWith(userId, undefined);
  });

  it('should throw error when regenerating passkey for non-existent user', async () => {
    const userId = 'nonexistent';

    mockUserService.regeneratePasskey.mockRejectedValue(
      new HttpException('User Not found', HttpStatus.NOT_FOUND)
    );

    await expect(userController.regeneratePasskey(userId)).rejects.toThrow(HttpException);
    expect(mockUserService.regeneratePasskey).toHaveBeenCalledWith(userId, undefined);
  });

  it('should ensure regenerated passkey is in valid range', async () => {
    const userId = '1';
    const newPasskey = 555555;

    mockUserService.regeneratePasskey.mockResolvedValue(newPasskey);

    const result = await userController.regeneratePasskey(userId);

    expect(result.passkey).toBeGreaterThanOrEqual(100000);
    expect(result.passkey).toBeLessThanOrEqual(999999);
    expect(mockUserService.regeneratePasskey).toHaveBeenCalledWith(userId, undefined);
  });


});

    describe('findByPasskey', () => {
      it('should find user by valid passkey (Passkey Validation)', async () => {
        // Test Case: Passkey Validation
        // Expected: Use generated passkey for fingerprint device registration
        // Expected: Passkey should be accepted and allow biometric registration
        const passkey = '123456';
        const expectedUser = {
          id: userDto.id,
          name: userDto.name,
          gender: userDto.gender,
          organizationId: 'org123',
        };

        mockUserService.findByPasskey.mockResolvedValue(expectedUser);

        const result = await userController.findByPasskey(passkey);

        expect(result).toEqual(expectedUser);
        expect(mockUserService.findByPasskey).toHaveBeenCalledWith(123456);
      });

      it('should throw error for invalid passkey format', async () => {
        const invalidPasskey = 'invalid';

        await expect(userController.findByPasskey(invalidPasskey)).rejects.toThrow(
          new HttpException(
            {
              status: HttpStatus.NOT_FOUND,
              error: 'Not Found',
              message: 'Invalid passkey format',
            },
            HttpStatus.NOT_FOUND
          )
        );
      });

      it('should throw error when user not found by passkey', async () => {
        const passkey = '999999';

        mockUserService.findByPasskey.mockRejectedValue(
          new HttpException('User Not found', HttpStatus.NOT_FOUND)
        );

        await expect(userController.findByPasskey(passkey)).rejects.toThrow(HttpException);
      });

      it('should handle various valid passkey formats', async () => {
        const validPasskeys = ['123456', '654321', '111111', '999999'];
        const mockUsers = validPasskeys.map((passkey, index) => ({
          id: `user${index + 1}`,
          name: `User ${index + 1}`,
          gender: 'male',
          organizationId: 'org123',
        }));

        for (let i = 0; i < validPasskeys.length; i++) {
          mockUserService.findByPasskey.mockResolvedValueOnce(mockUsers[i]);
          
          const result = await userController.findByPasskey(validPasskeys[i]);
          
          expect(result).toEqual(mockUsers[i]);
          expect(mockUserService.findByPasskey).toHaveBeenCalledWith(parseInt(validPasskeys[i]));
        }
      });
    });
  });

  describe('Passkey System Integration Tests', () => {
    it('should demonstrate complete passkey workflow through controller', async () => {
      // Step 1: Create user with generated passkey
      const generatedPasskey = 654321;
      mockUserService.create.mockResolvedValue(generatedPasskey);
      
      const createResult = await userController.create(userDto);
      expect(createResult).toEqual({ passkey: generatedPasskey });
      expect(createResult.passkey).toBeGreaterThanOrEqual(100000);
      expect(createResult.passkey).toBeLessThanOrEqual(999999);
      
      // Step 2: Find user by generated passkey
      const expectedUser = {
        id: userDto.id,
        name: userDto.name,
        gender: userDto.gender,
        organizationId: 'org123',
      };
      mockUserService.findByPasskey.mockResolvedValue(expectedUser);
      
      const foundUser = await userController.findByPasskey(generatedPasskey.toString());
      expect(foundUser).toEqual(expectedUser);
      
      // Step 3: Regenerate passkey
      const newPasskey = 789012;
      mockUserService.regeneratePasskey.mockResolvedValue(newPasskey);
      
      const regenerateResult = await userController.regeneratePasskey(userDto.id);
      expect(regenerateResult.passkey).toBe(newPasskey);
      
      // Step 4: Verify new passkey works
      mockUserService.findByPasskey.mockResolvedValue({ ...expectedUser, passkey: newPasskey });
      
      const foundUserWithNewPasskey = await userController.findByPasskey(newPasskey.toString());
      expect(foundUserWithNewPasskey).toBeTruthy();
    });

    it('should handle edge cases for passkey operations', async () => {
      // Test minimum and maximum valid passkeys
      const edgePasskeys = ['100000', '999999'];
      
      for (const passkey of edgePasskeys) {
        mockUserService.findByPasskey.mockResolvedValue({
          id: `user_${passkey}`,
          name: `User ${passkey}`,
          gender: 'male',
          organizationId: 'org123',
        });
        
        const result = await userController.findByPasskey(passkey);
        expect(result).toBeTruthy();
        expect(result.id).toBe(`user_${passkey}`);
      }
    });

    it('should validate passkey acceptance for biometric registration workflow', async () => {
      // Test Case: Passkey Validation
      // Expected: Passkey should be accepted and allow biometric registration
      const passkey = '123456';
      const userForBiometric = {
        id: 'O001E001',
        name: 'John Doe',
        gender: 'male',
        organizationId: 'O001',
      };

      mockUserService.findByPasskey.mockResolvedValue(userForBiometric);

      const result = await userController.findByPasskey(passkey);

      // Verify user can be found and has required fields for biometric registration
      expect(result).toBeTruthy();
      expect(result.id).toBeTruthy();
      expect(result.name).toBeTruthy();
      expect(result.organizationId).toBeTruthy();
      
      // This validates that the passkey is accepted and allows the user to proceed
      // with biometric registration (which would happen in the next step)
    });

    it('should validate randomly generated passkey format and uniqueness', async () => {
      // Test multiple user creations to ensure passkeys are properly generated
      const users = Array.from({ length: 5 }, (_, i) => ({
        ...userDto,
        id: `user${i + 1}`,
        email: `user${i + 1}@test.com`,
        empNo: `EMP00${i + 1}`,
      }));

      const generatedPasskeys = [123456, 234567, 345678, 456789, 567890];
      
      // Mock unique passkeys for each user
      generatedPasskeys.forEach((passkey, index) => {
        mockUserService.create.mockResolvedValueOnce(passkey);
      });

      const results = [];
      for (let i = 0; i < users.length; i++) {
        const result = await userController.create(users[i]);
        results.push(result);
        
        // Validate passkey format
        expect(result.passkey).toBeGreaterThanOrEqual(100000);
        expect(result.passkey).toBeLessThanOrEqual(999999);
        expect(typeof result.passkey).toBe('number');
      }

      // Validate uniqueness
      const allPasskeys = results.map(r => r.passkey);
      const uniquePasskeys = new Set(allPasskeys);
      expect(uniquePasskeys.size).toBe(allPasskeys.length);
    });
  });
});