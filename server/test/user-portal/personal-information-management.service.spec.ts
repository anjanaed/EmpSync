import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../src/core/user/user.controller';
import { UserService } from '../../src/core/user/user.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../src/core/authentication/roles.guard';

describe('User Portal - Personal Information Management Service', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserService = {
    findOne: jest.fn(),
    update: jest.fn(),
    findByPasskey: jest.fn(),
    regeneratePasskey: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('Test Case 3: Personal Information Viewing', () => {
    it('should successfully retrieve user personal information', async () => {
      // Arrange
      const userId = 'EMP001';
      const expectedUserInfo = {
        id: 'EMP001',
        name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '+94771234567',
        address: '123 Main St, Colombo',
        nic: '123456789V',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        department: 'Engineering',
        designation: 'Software Engineer',
        salary: 150000,
        joinDate: '2023-01-01',
        organizationId: 'org-123',
        passkey: 123456,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      mockUserService.findOne.mockResolvedValue(expectedUserInfo);

      // Act
      const result = await userController.findOne(userId);

      // Assert
      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUserInfo);
      expect(result.id).toBe('EMP001');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john.doe@company.com');
      expect(result.salary).toBe(150000);
    });

    it('should display all required personal information fields', async () => {
      // Arrange
      const userId = 'EMP002';
      const userInfo = {
        id: 'EMP002',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        phone: '+94779876543',
        address: '456 Park Avenue, Kandy',
        nic: '987654321V',
        dateOfBirth: '1985-06-20',
        gender: 'female',
        department: 'Human Resources',
        designation: 'HR Manager',
        salary: 200000,
        joinDate: '2022-03-15',
        organizationId: 'org-123',
        passkey: 654321,
      };

      mockUserService.findOne.mockResolvedValue(userInfo);

      // Act
      const result = await userController.findOne(userId);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('phone');
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('nic');
      expect(result).toHaveProperty('dateOfBirth');
      expect(result).toHaveProperty('gender');
      expect(result).toHaveProperty('department');
      expect(result).toHaveProperty('designation');
      expect(result).toHaveProperty('salary');
      expect(result).toHaveProperty('organizationId');
    });

    it('should handle user not found scenarios', async () => {
      // Arrange
      const nonExistentUserId = 'EMP999';

      mockUserService.findOne.mockRejectedValue(
        new HttpException('User not found', HttpStatus.NOT_FOUND)
      );

      // Act & Assert
      await expect(userController.findOne(nonExistentUserId)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND)
      );
      expect(userService.findOne).toHaveBeenCalledWith(nonExistentUserId);
    });
  });

  describe('Test Case 4: Personal Information Editing', () => {
    it('should successfully update editable personal information fields', async () => {
      // Arrange
      const userId = 'EMP001';
      const updateData = {
        phone: '+94771111111',
        address: '789 New Street, Galle',
        email: 'john.doe.updated@company.com',
      };

      mockUserService.update.mockResolvedValue('User Updated');

      // Act
      const result = await userController.update(userId, updateData);

      // Assert
      expect(userService.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toBe('User Updated');
    });

    it('should regenerate user passkey when requested', async () => {
      // Arrange
      const userId = 'EMP001';
      const newPasskey = 789012;

      mockUserService.regeneratePasskey.mockResolvedValue(newPasskey);

      // Act
      const result = await userController.regeneratePasskey(userId);

      // Assert
      expect(userService.regeneratePasskey).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ passkey: newPasskey });
      expect(result.passkey).toBe(789012);
    });

    it('should handle update failures gracefully', async () => {
      // Arrange
      const userId = 'EMP001';
      const invalidUpdateData = {
        salary: -50000, // Invalid negative salary
      };

      mockUserService.update.mockRejectedValue(
        new Error('Invalid update data')
      );

      // Act & Assert
      await expect(userController.update(userId, invalidUpdateData)).rejects.toThrow(
        HttpException
      );
    });

    it('should validate phone number format during update', async () => {
      // Arrange
      const userId = 'EMP001';
      const invalidPhoneData = {
        phone: 'invalid-phone-number',
        name: 'John Doe', // Add required fields
        email: 'john@example.com',
      };

      mockUserService.update.mockRejectedValue(
        new Error('Invalid phone number format')
      );

      // Act & Assert
      await expect(userController.update(userId, invalidPhoneData)).rejects.toThrow(
        HttpException
      );
    });
  });

  describe('Test Case 5: Personal Information Validation', () => {
    it('should validate email format during personal information update', async () => {
      // Arrange
      const userId = 'EMP001';
      const invalidEmailData = {
        email: 'invalid-email-format',
      };

      mockUserService.update.mockRejectedValue(
        new Error('Invalid email format')
      );

      // Act & Assert
      await expect(userController.update(userId, invalidEmailData)).rejects.toThrow(
        HttpException
      );
      expect(userService.update).toHaveBeenCalledWith(userId, invalidEmailData);
    });

    it('should validate required fields are not empty', async () => {
      // Arrange
      const userId = 'EMP001';
      const emptyFieldsData = {
        name: '',
        email: '',
      };

      mockUserService.update.mockRejectedValue(
        new Error('Name and email are required fields')
      );

      // Act & Assert
      await expect(userController.update(userId, emptyFieldsData)).rejects.toThrow(
        HttpException
      );
    });

    it('should validate NIC format for Sri Lankan users', async () => {
      // Arrange
      const userId = 'EMP001';
      const invalidNicData = {
        nic: 'invalid-nic-format',
        name: 'John Doe', // Add required fields
        email: 'john@example.com',
      };

      mockUserService.update.mockRejectedValue(
        new Error('Invalid NIC format. Please use correct Sri Lankan NIC format')
      );

      // Act & Assert
      await expect(userController.update(userId, invalidNicData)).rejects.toThrow(
        HttpException
      );
    });

    it('should validate date of birth is not in the future', async () => {
      // Arrange
      const userId = 'EMP001';
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const invalidDateData = {
        dateOfBirth: futureDate.toISOString(),
        name: 'John Doe', // Add required fields
        email: 'john@example.com',
      };

      mockUserService.update.mockRejectedValue(
        new Error('Date of birth cannot be in the future')
      );

      // Act & Assert
      await expect(userController.update(userId, invalidDateData)).rejects.toThrow(
        HttpException
      );
    });

    it('should validate gender field accepts only valid values', async () => {
      // Arrange
      const userId = 'EMP001';
      const invalidGenderData = {
        gender: 'invalid-gender',
      };

      mockUserService.update.mockRejectedValue(
        new Error('Gender must be either "male" or "female"')
      );

      // Act & Assert
      await expect(userController.update(userId, invalidGenderData)).rejects.toThrow(
        HttpException
      );
    });

    it('should find user by passkey for authentication', async () => {
      // Arrange
      const passkey = '123456';
      const expectedUser = {
        id: 'EMP001',
        name: 'John Doe',
        gender: 'male',
        organizationId: 'org-123',
      };

      mockUserService.findByPasskey.mockResolvedValue(expectedUser);

      // Act
      const result = await userController.findByPasskey(passkey);

      // Assert
      expect(userService.findByPasskey).toHaveBeenCalledWith(123456);
      expect(result).toEqual(expectedUser);
      expect(result.id).toBe('EMP001');
    });

    it('should handle invalid passkey queries', async () => {
      // Arrange
      const invalidPasskey = '999999';

      mockUserService.findByPasskey.mockRejectedValue(
        new Error('User not found with this passkey')
      );

      // Act & Assert
      await expect(userController.findByPasskey(invalidPasskey)).rejects.toThrow(
        HttpException
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
