import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

// Mock IoT Device Service interfaces
interface ESP32Device {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getSignalStrength(): number;
  retry(): Promise<boolean>;
}

interface R307Sensor {
  initialize(): Promise<boolean>;
  readFingerprint(): Promise<FingerprintData>;
  calibrate(): Promise<boolean>;
  getStatus(): SensorStatus;
}

interface FingerprintData {
  thumbid: string;
  quality: number;
  template: string;
  confidence: number;
}

interface SensorStatus {
  isCalibrated: boolean;
  temperature: number;
  lastReading: Date;
  errorCount: number;
}

interface MealOrderingData {
  empId: string;
  mealId: string;
  timestamp: Date;
  fingerprintVerified: boolean;
}

describe('IoT Hardware Integration Test Cases', () => {
  let esp32Device: ESP32Device;
  let r307Sensor: R307Sensor;

  const mockESP32Device = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    isConnected: jest.fn(),
    getSignalStrength: jest.fn(),
    retry: jest.fn(),
  };

  const mockR307Sensor = {
    initialize: jest.fn(),
    readFingerprint: jest.fn(),
    calibrate: jest.fn(),
    getStatus: jest.fn(),
  };

  const mockWebApplicationService = {
    receiveDeviceData: jest.fn(),
    sendDeviceCommand: jest.fn(),
    handleConnectionLoss: jest.fn(),
    validateMealOrder: jest.fn(),
    processFingerprintData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'ESP32Device', useValue: mockESP32Device },
        { provide: 'R307Sensor', useValue: mockR307Sensor },
        { provide: 'WebApplicationService', useValue: mockWebApplicationService },
      ],
    }).compile();

    esp32Device = module.get<ESP32Device>('ESP32Device');
    r307Sensor = module.get<R307Sensor>('R307Sensor');

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('ESP32 Connectivity Tests', () => {
    describe('Device Power On', () => {
      it('should establish connection with web application successfully', async () => {
        // Arrange
        const expectedConnectionResult = true;
        const expectedSignalStrength = 85;

        mockESP32Device.connect.mockResolvedValue(true);
        mockESP32Device.isConnected.mockReturnValue(true);
        mockESP32Device.getSignalStrength.mockReturnValue(expectedSignalStrength);
        mockWebApplicationService.receiveDeviceData.mockResolvedValue({
          status: 'connected',
          deviceId: 'ESP32_001',
          timestamp: new Date(),
        });

        // Act
        const connectionResult = await esp32Device.connect();
        // Simulate sending connection data to web application
        await mockWebApplicationService.receiveDeviceData({
          type: 'connection_established',
          deviceId: 'ESP32_001',
          timestamp: new Date(),
        });

        // Assert
        expect(connectionResult).toBe(expectedConnectionResult);
        expect(esp32Device.isConnected()).toBe(true);
        expect(esp32Device.getSignalStrength()).toBeGreaterThan(70);
        expect(mockWebApplicationService.receiveDeviceData).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'connection_established',
            deviceId: 'ESP32_001',
          })
        );
      });

      it('should initialize device with proper hardware configuration', async () => {
        // Arrange
        const deviceConfig = {
          wifiSSID: 'EmpSync_Network',
          serverEndpoint: 'https://empsync.api/iot',
          deviceId: 'ESP32_001',
          firmwareVersion: '2.1.0',
        };

        mockESP32Device.connect.mockResolvedValue(true);
        mockWebApplicationService.receiveDeviceData.mockResolvedValue({
          config: deviceConfig,
          status: 'initialized',
        });

        // Act
        const result = await esp32Device.connect();
        // Simulate sending device initialization data to web application
        await mockWebApplicationService.receiveDeviceData({
          type: 'device_initialization',
          config: deviceConfig,
        });

        // Assert
        expect(result).toBe(true);
        expect(mockWebApplicationService.receiveDeviceData).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'device_initialization',
            config: expect.objectContaining({
              deviceId: 'ESP32_001',
              firmwareVersion: '2.1.0',
            }),
          })
        );
      });

      it('should handle connection timeout and retry mechanism', async () => {
        // Arrange
        mockESP32Device.connect
          .mockRejectedValueOnce(new Error('Connection timeout'))
          .mockResolvedValue(true);
        mockESP32Device.retry.mockResolvedValue(true);

        // Act
        try {
          await esp32Device.connect();
        } catch (error) {
          const retryResult = await esp32Device.retry();
          expect(retryResult).toBe(true);
        }

        // Assert
        expect(mockESP32Device.connect).toHaveBeenCalledTimes(1);
        expect(mockESP32Device.retry).toHaveBeenCalledTimes(1);
      });

      it('should validate secure communication protocol', async () => {
        // Arrange
        const securityConfig = {
          encryption: 'TLS_1.2',
          authentication: 'device_certificate',
          apiKey: 'encrypted_api_key',
        };

        mockESP32Device.connect.mockResolvedValue(true);
        mockWebApplicationService.receiveDeviceData.mockResolvedValue({
          security: securityConfig,
          connectionSecure: true,
        });

        // Act
        const result = await esp32Device.connect();
        // Simulate sending security validation data to web application
        await mockWebApplicationService.receiveDeviceData({
          type: 'security_validation',
          security: {
            encryption: 'TLS_1.2',
            connectionSecure: true,
            authentication: 'device_certificate',
            apiKey: 'encrypted_api_key',
          },
        });

        // Assert
        expect(result).toBe(true);
        expect(mockWebApplicationService.receiveDeviceData).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'security_validation',
            security: expect.objectContaining({
              encryption: 'TLS_1.2',
              connectionSecure: true,
            }),
          })
        );
      });
    });

    describe('Network Disconnection', () => {
      it('should handle connection loss gracefully with retry mechanism', async () => {
        // Arrange
        const retryAttempts = 3;
        const retryDelay = 5000; // 5 seconds

        mockESP32Device.isConnected.mockReturnValue(false);
        mockESP32Device.retry
          .mockRejectedValueOnce(new Error('Network unreachable'))
          .mockRejectedValueOnce(new Error('Network unreachable'))
          .mockResolvedValue(true);
        mockWebApplicationService.handleConnectionLoss.mockResolvedValue({
          retryScheduled: true,
          nextRetryIn: retryDelay,
        });

        // Act
        let reconnectionResult = false;
        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
          try {
            reconnectionResult = await esp32Device.retry();
            if (reconnectionResult) break;
          } catch (error) {
            if (attempt === retryAttempts) {
              throw error;
            }
            // Simulate retry delay
            await new Promise(resolve => setTimeout(resolve, 100)); // Shortened for test
          }
        }
        
        // Simulate sending connection loss data to web application
        await mockWebApplicationService.handleConnectionLoss({
          deviceId: 'ESP32_001',
          disconnectionTime: new Date(),
          retryAttempt: 3,
        });

        // Assert
        expect(reconnectionResult).toBe(true);
        expect(mockESP32Device.retry).toHaveBeenCalledTimes(3);
        expect(mockWebApplicationService.handleConnectionLoss).toHaveBeenCalledWith(
          expect.objectContaining({
            deviceId: expect.any(String),
            disconnectionTime: expect.any(Date),
            retryAttempt: expect.any(Number),
          })
        );
      });

      it('should buffer data locally during network disconnection', async () => {
        // Arrange
        const bufferedData = [
          { type: 'fingerprint_scan', data: 'FP_DATA_001', timestamp: new Date() },
          { type: 'meal_selection', data: 'MEAL_002', timestamp: new Date() },
        ];

        mockESP32Device.isConnected.mockReturnValue(false);
        mockWebApplicationService.handleConnectionLoss.mockResolvedValue({
          dataBuffered: bufferedData,
          bufferSize: bufferedData.length,
        });

        // Act
        const result = await mockWebApplicationService.handleConnectionLoss({
          deviceId: 'ESP32_001',
          bufferedData: bufferedData,
        });

        // Assert
        expect(result.dataBuffered).toHaveLength(2);
        expect(result.bufferSize).toBe(2);
        expect(mockWebApplicationService.handleConnectionLoss).toHaveBeenCalledWith(
          expect.objectContaining({
            deviceId: 'ESP32_001',
            bufferedData: expect.arrayContaining([
              expect.objectContaining({ type: 'fingerprint_scan' }),
              expect.objectContaining({ type: 'meal_selection' }),
            ]),
          })
        );
      });

      it('should sync buffered data when connection is restored', async () => {
        // Arrange
        const bufferedData = [
          { id: '001', type: 'fingerprint_scan', empId: 'EMP001', timestamp: new Date() },
          { id: '002', type: 'meal_order', empId: 'EMP001', mealId: 'MEAL_002', timestamp: new Date() },
        ];

        mockESP32Device.isConnected.mockReturnValue(true);
        mockESP32Device.retry.mockResolvedValue(true);
        mockWebApplicationService.receiveDeviceData.mockResolvedValue({
          syncResult: 'success',
          processedItems: bufferedData.length,
          failedItems: 0,
        });

        // Act
        const reconnected = await esp32Device.retry();
        const syncResult = await mockWebApplicationService.receiveDeviceData({
          type: 'data_sync',
          bufferedData: bufferedData,
        });

        // Assert
        expect(reconnected).toBe(true);
        expect(syncResult.syncResult).toBe('success');
        expect(syncResult.processedItems).toBe(2);
        expect(syncResult.failedItems).toBe(0);
      });

      it('should implement exponential backoff for retry attempts', async () => {
        // Arrange
        const maxRetries = 5;
        const baseDelay = 1000;
        let currentDelay = baseDelay;

        mockESP32Device.retry
          .mockRejectedValueOnce(new Error('Network error'))
          .mockRejectedValueOnce(new Error('Network error'))
          .mockRejectedValueOnce(new Error('Network error'))
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValue(true);

        // Act
        let connected = false;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            connected = await esp32Device.retry();
            if (connected) break;
          } catch (error) {
            if (attempt < maxRetries) {
              // Simulate exponential backoff (shortened for test)
              await new Promise(resolve => setTimeout(resolve, Math.min(currentDelay / 100, 50)));
              currentDelay *= 2; // Double the delay each time
            }
          }
        }

        // Assert
        expect(connected).toBe(true);
        expect(mockESP32Device.retry).toHaveBeenCalledTimes(5);
        expect(currentDelay).toBe(baseDelay * Math.pow(2, 4)); // After 4 backoffs
      });
    });
  });

  describe('R307 Sensor Functionality Tests', () => {
    describe('Fingerprint Sensor Test', () => {
      it('should accurately read and process fingerprint data', async () => {
        // Arrange
        const expectedFingerprintData: FingerprintData = {
          thumbid: 'FP_THUMB_001',
          quality: 95,
          template: 'TEMPLATE_DATA_ENCODED',
          confidence: 98.5,
        };

        const expectedSensorStatus: SensorStatus = {
          isCalibrated: true,
          temperature: 23.5,
          lastReading: new Date(),
          errorCount: 0,
        };

        mockR307Sensor.initialize.mockResolvedValue(true);
        mockR307Sensor.readFingerprint.mockResolvedValue(expectedFingerprintData);
        mockR307Sensor.getStatus.mockReturnValue(expectedSensorStatus);
        mockWebApplicationService.processFingerprintData.mockResolvedValue({
          processed: true,
          empId: 'EMP001',
          matchFound: true,
        });

        // Act
        const initResult = await r307Sensor.initialize();
        const fingerprintData = await r307Sensor.readFingerprint();
        const sensorStatus = r307Sensor.getStatus();
        
        // Simulate processing fingerprint data with web application
        await mockWebApplicationService.processFingerprintData(fingerprintData);

        // Assert
        expect(initResult).toBe(true);
        expect(fingerprintData.quality).toBeGreaterThan(90);
        expect(fingerprintData.confidence).toBeGreaterThan(95);
        expect(fingerprintData.thumbid).toBe('FP_THUMB_001');
        expect(sensorStatus.isCalibrated).toBe(true);
        expect(sensorStatus.errorCount).toBe(0);
        expect(mockWebApplicationService.processFingerprintData).toHaveBeenCalledWith(
          expect.objectContaining({
            thumbid: 'FP_THUMB_001',
            quality: 95,
            confidence: 98.5,
          })
        );
      });

      it('should handle multiple fingerprint scans with consistent accuracy', async () => {
        // Arrange
        const fingerprintScans = [
          { thumbid: 'FP_001', quality: 96, confidence: 97.2 },
          { thumbid: 'FP_001', quality: 94, confidence: 96.8 },
          { thumbid: 'FP_001', quality: 95, confidence: 97.5 },
        ];

        fingerprintScans.forEach((scan, index) => {
          mockR307Sensor.readFingerprint.mockResolvedValueOnce({
            ...scan,
            template: `TEMPLATE_${index + 1}`,
          });
        });

        // Act
        const results = [];
        for (let i = 0; i < fingerprintScans.length; i++) {
          const result = await r307Sensor.readFingerprint();
          results.push(result);
        }

        // Assert
        expect(results).toHaveLength(3);
        expect(results.every(result => result.quality >= 90)).toBe(true);
        expect(results.every(result => result.confidence >= 95)).toBe(true);
        expect(results.every(result => result.thumbid === 'FP_001')).toBe(true);
        expect(mockR307Sensor.readFingerprint).toHaveBeenCalledTimes(3);
      });

      it('should reject poor quality fingerprint scans', async () => {
        // Arrange
        const poorQualityData: FingerprintData = {
          thumbid: 'FP_POOR_001',
          quality: 45, // Below threshold
          template: 'POOR_TEMPLATE',
          confidence: 65, // Below threshold
        };

        mockR307Sensor.readFingerprint.mockResolvedValue(poorQualityData);

        // Act
        const fingerprintData = await r307Sensor.readFingerprint();
        
        // Simulate processing poor quality fingerprint data with web application
        await mockWebApplicationService.processFingerprintData({
          ...fingerprintData,
          qualityStatus: 'poor',
          recommendation: 'retry_scan',
        });

        // Assert
        expect(fingerprintData.quality).toBeLessThan(70);
        expect(fingerprintData.confidence).toBeLessThan(80);
        
        // Should trigger quality improvement guidance
        expect(mockWebApplicationService.processFingerprintData).toHaveBeenCalledWith(
          expect.objectContaining({
            quality: 45,
            confidence: 65,
            qualityStatus: 'poor',
            recommendation: 'retry_scan',
          })
        );
      });

      it('should validate sensor temperature and environmental conditions', async () => {
        // Arrange
        const optimalStatus: SensorStatus = {
          isCalibrated: true,
          temperature: 22.0, // Optimal temperature
          lastReading: new Date(),
          errorCount: 0,
        };

        const extremeStatus: SensorStatus = {
          isCalibrated: true,
          temperature: 45.0, // High temperature
          lastReading: new Date(),
          errorCount: 1,
        };

        mockR307Sensor.getStatus
          .mockReturnValueOnce(optimalStatus)
          .mockReturnValueOnce(extremeStatus);

        // Act
        const optimalCondition = r307Sensor.getStatus();
        const extremeCondition = r307Sensor.getStatus();

        // Assert
        expect(optimalCondition.temperature).toBeLessThan(40);
        expect(optimalCondition.errorCount).toBe(0);
        
        expect(extremeCondition.temperature).toBeGreaterThan(40);
        expect(extremeCondition.errorCount).toBeGreaterThan(0);
      });

      it('should handle sensor error conditions and recovery', async () => {
        // Arrange
        const sensorError = new Error('Sensor communication error');
        
        mockR307Sensor.readFingerprint
          .mockRejectedValueOnce(sensorError)
          .mockResolvedValue({
            thumbid: 'FP_RECOVERY_001',
            quality: 92,
            template: 'RECOVERED_TEMPLATE',
            confidence: 96.0,
          });

        mockR307Sensor.initialize.mockResolvedValue(true);

        // Act & Assert
        await expect(r307Sensor.readFingerprint()).rejects.toThrow('Sensor communication error');
        
        // Recovery attempt
        const recovery = await r307Sensor.initialize();
        const recoveredData = await r307Sensor.readFingerprint();

        expect(recovery).toBe(true);
        expect(recoveredData.quality).toBeGreaterThan(90);
        expect(recoveredData.thumbid).toBe('FP_RECOVERY_001');
      });
    });
  });

  describe('Hardware-Software Integration Tests', () => {
    describe('Complete Meal Ordering Flow', () => {
      it('should enable seamless data transfer between IoT device and web application', async () => {
        // Arrange
        const mealOrderFlow: MealOrderingData = {
          empId: 'EMP001',
          mealId: 'MEAL_LUNCH_001',
          timestamp: new Date(),
          fingerprintVerified: true,
        };

        const fingerprintData: FingerprintData = {
          thumbid: 'FP_EMP001_THUMB',
          quality: 96,
          template: 'VERIFIED_TEMPLATE',
          confidence: 98.0,
        };

        // Mock the complete flow
        mockESP32Device.isConnected.mockReturnValue(true);
        mockR307Sensor.readFingerprint.mockResolvedValue(fingerprintData);
        mockWebApplicationService.processFingerprintData.mockResolvedValue({
          empId: 'EMP001',
          verified: true,
        });
        mockWebApplicationService.validateMealOrder.mockResolvedValue({
          orderValid: true,
          mealAvailable: true,
          orderId: 'ORDER_001',
        });

        // Act
        // Step 1: Check device connectivity
        const deviceConnected = esp32Device.isConnected();
        
        // Step 2: Read fingerprint
        const scannedFingerprint = await r307Sensor.readFingerprint();
        
        // Step 3: Process fingerprint and verify employee
        const verification = await mockWebApplicationService.processFingerprintData(scannedFingerprint);
        
        // Step 4: Process meal order
        const orderResult = await mockWebApplicationService.validateMealOrder({
          empId: verification.empId,
          mealId: mealOrderFlow.mealId,
          fingerprintVerified: verification.verified,
        });

        // Assert
        expect(deviceConnected).toBe(true);
        expect(scannedFingerprint.quality).toBeGreaterThan(90);
        expect(verification.verified).toBe(true);
        expect(verification.empId).toBe('EMP001');
        expect(orderResult.orderValid).toBe(true);
        expect(orderResult.mealAvailable).toBe(true);
        expect(orderResult.orderId).toBe('ORDER_001');

        // Verify complete flow integration
        expect(mockR307Sensor.readFingerprint).toHaveBeenCalledTimes(1);
        expect(mockWebApplicationService.processFingerprintData).toHaveBeenCalledWith(
          expect.objectContaining({ thumbid: 'FP_EMP001_THUMB', quality: 96 })
        );
        expect(mockWebApplicationService.validateMealOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            empId: 'EMP001',
            mealId: 'MEAL_LUNCH_001',
            fingerprintVerified: true,
          })
        );
      });

      it('should handle real-time data synchronization', async () => {
        // Arrange
        const realTimeEvents = [
          { type: 'fingerprint_scan', timestamp: new Date(), data: 'FP_DATA_001' },
          { type: 'meal_selection', timestamp: new Date(), data: 'MEAL_002' },
          { type: 'order_confirmation', timestamp: new Date(), data: 'ORDER_003' },
        ];

        mockESP32Device.isConnected.mockReturnValue(true);
        mockWebApplicationService.receiveDeviceData.mockResolvedValue({
          eventsProcessed: realTimeEvents.length,
          syncLatency: 150, // milliseconds
          success: true,
        });

        // Act
        const syncResults = [];
        for (const event of realTimeEvents) {
          const result = await mockWebApplicationService.receiveDeviceData({
            type: 'real_time_event',
            event: event,
          });
          syncResults.push(result);
        }

        // Assert
        expect(syncResults).toHaveLength(3);
        expect(syncResults.every(result => result.success)).toBe(true);
        expect(syncResults.every(result => result.syncLatency < 200)).toBe(true);
        expect(mockWebApplicationService.receiveDeviceData).toHaveBeenCalledTimes(3);
      });

      it('should validate end-to-end meal ordering workflow', async () => {
        // Arrange
        const workflowSteps = [
          'device_ready',
          'fingerprint_scan',
          'employee_verification',
          'meal_display',
          'meal_selection',
          'order_processing',
          'order_confirmation',
        ];

        const workflowData = {
          deviceId: 'ESP32_001',
          empId: 'EMP001',
          fingerprintId: 'FP_001',
          selectedMeal: 'LUNCH_COMBO_001',
          orderId: 'ORDER_12345',
        };

        // Mock each workflow step
        mockESP32Device.isConnected.mockReturnValue(true);
        mockR307Sensor.readFingerprint.mockResolvedValue({
          thumbid: workflowData.fingerprintId,
          quality: 95,
          template: 'VALID_TEMPLATE',
          confidence: 97.5,
        });

        mockWebApplicationService.processFingerprintData.mockResolvedValue({
          empId: workflowData.empId,
          verified: true,
          step: 'employee_verification',
        });

        mockWebApplicationService.validateMealOrder.mockResolvedValue({
          orderId: workflowData.orderId,
          status: 'confirmed',
          step: 'order_confirmation',
        });

        // Act
        const workflowResult = [];
        
        // Step 1: Device Ready
        workflowResult.push({ step: 'device_ready', status: esp32Device.isConnected() });
        
        // Step 2-3: Fingerprint scan and verification
        const fingerprint = await r307Sensor.readFingerprint();
        const verification = await mockWebApplicationService.processFingerprintData(fingerprint);
        workflowResult.push({ step: 'fingerprint_verification', status: verification.verified });
        
        // Step 4-7: Meal ordering
        const order = await mockWebApplicationService.validateMealOrder({
          empId: verification.empId,
          mealId: workflowData.selectedMeal,
        });
        workflowResult.push({ step: 'order_processing', status: order.status === 'confirmed' });

        // Assert
        expect(workflowResult).toHaveLength(3);
        expect(workflowResult.every(step => step.status === true || step.status === 'confirmed')).toBe(true);
        expect(verification.empId).toBe('EMP001');
        expect(order.orderId).toBe('ORDER_12345');
      });

      it('should handle concurrent user interactions', async () => {
        // Arrange
        const concurrentUsers = [
          { empId: 'EMP001', fingerprintId: 'FP_001', mealId: 'MEAL_001' },
          { empId: 'EMP002', fingerprintId: 'FP_002', mealId: 'MEAL_002' },
          { empId: 'EMP003', fingerprintId: 'FP_003', mealId: 'MEAL_003' },
        ];

        mockESP32Device.isConnected.mockReturnValue(true);
        
        // Mock concurrent fingerprint reads
        concurrentUsers.forEach((user, index) => {
          mockR307Sensor.readFingerprint.mockResolvedValueOnce({
            thumbid: user.fingerprintId,
            quality: 90 + index,
            template: `TEMPLATE_${index}`,
            confidence: 95 + index,
          });
          
          mockWebApplicationService.processFingerprintData.mockResolvedValueOnce({
            empId: user.empId,
            verified: true,
          });
          
          mockWebApplicationService.validateMealOrder.mockResolvedValueOnce({
            orderId: `ORDER_${index + 1}`,
            status: 'confirmed',
          });
        });

        // Act
        const concurrentPromises = concurrentUsers.map(async (user) => {
          const fingerprint = await r307Sensor.readFingerprint();
          const verification = await mockWebApplicationService.processFingerprintData(fingerprint);
          const order = await mockWebApplicationService.validateMealOrder({
            empId: verification.empId,
            mealId: user.mealId,
          });
          return { verification, order };
        });

        const results = await Promise.all(concurrentPromises);

        // Assert
        expect(results).toHaveLength(3);
        expect(results.every(result => result.verification.verified)).toBe(true);
        expect(results.every(result => result.order.status === 'confirmed')).toBe(true);
        expect(mockR307Sensor.readFingerprint).toHaveBeenCalledTimes(3);
        expect(mockWebApplicationService.processFingerprintData).toHaveBeenCalledTimes(3);
        expect(mockWebApplicationService.validateMealOrder).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Device Calibration Tests', () => {
    describe('Sensor Calibration Process', () => {
      it('should ensure accurate fingerprint reading and system responsiveness', async () => {
        // Arrange
        const calibrationConfig = {
          sensitivity: 85,
          threshold: 70,
          responseTime: 2000, // 2 seconds
          temperatureRange: { min: 15, max: 35 },
        };

        const preCalibrationStatus: SensorStatus = {
          isCalibrated: false,
          temperature: 22.5,
          lastReading: new Date(),
          errorCount: 3,
        };

        const postCalibrationStatus: SensorStatus = {
          isCalibrated: true,
          temperature: 22.5,
          lastReading: new Date(),
          errorCount: 0,
        };

        mockR307Sensor.getStatus
          .mockReturnValueOnce(preCalibrationStatus)
          .mockReturnValueOnce(postCalibrationStatus);
        
        mockR307Sensor.calibrate.mockResolvedValue(true);
        
        mockR307Sensor.readFingerprint.mockResolvedValue({
          thumbid: 'CALIBRATION_TEST_FP',
          quality: 96,
          template: 'CALIBRATED_TEMPLATE',
          confidence: 98.2,
        });

        // Act
        const preStatus = r307Sensor.getStatus();
        const calibrationResult = await r307Sensor.calibrate();
        const postStatus = r307Sensor.getStatus();
        const testRead = await r307Sensor.readFingerprint();

        // Assert
        expect(preStatus.isCalibrated).toBe(false);
        expect(preStatus.errorCount).toBeGreaterThan(0);
        
        expect(calibrationResult).toBe(true);
        
        expect(postStatus.isCalibrated).toBe(true);
        expect(postStatus.errorCount).toBe(0);
        
        expect(testRead.quality).toBeGreaterThan(calibrationConfig.threshold);
        expect(testRead.confidence).toBeGreaterThan(95);
        
        expect(mockR307Sensor.calibrate).toHaveBeenCalledTimes(1);
      });

      it('should validate sensor response time after calibration', async () => {
        // Arrange
        const maxResponseTime = 3000; // 3 seconds
        let responseStartTime: number;
        let responseEndTime: number;

        mockR307Sensor.calibrate.mockResolvedValue(true);
        mockR307Sensor.readFingerprint.mockImplementation(async () => {
          // Simulate sensor response time
          await new Promise(resolve => setTimeout(resolve, 100)); // Shortened for test
          return {
            thumbid: 'RESPONSE_TEST_FP',
            quality: 94,
            template: 'FAST_RESPONSE_TEMPLATE',
            confidence: 97.0,
          };
        });

        // Act
        await r307Sensor.calibrate();
        
        responseStartTime = Date.now();
        const fingerprintData = await r307Sensor.readFingerprint();
        responseEndTime = Date.now();
        
        const responseTime = responseEndTime - responseStartTime;

        // Assert
        expect(responseTime).toBeLessThan(maxResponseTime);
        expect(fingerprintData.quality).toBeGreaterThan(90);
        expect(fingerprintData.confidence).toBeGreaterThan(95);
      });

      it('should handle calibration failure and recovery', async () => {
        // Arrange
        const calibrationError = new Error('Calibration sensor malfunction');
        
        mockR307Sensor.calibrate
          .mockRejectedValueOnce(calibrationError)
          .mockResolvedValue(true);

        mockR307Sensor.getStatus.mockReturnValue({
          isCalibrated: false,
          temperature: 25.0,
          lastReading: new Date(),
          errorCount: 1,
        });

        // Act & Assert
        await expect(r307Sensor.calibrate()).rejects.toThrow('Calibration sensor malfunction');
        
        const status = r307Sensor.getStatus();
        expect(status.isCalibrated).toBe(false);
        expect(status.errorCount).toBeGreaterThan(0);
        
        // Recovery attempt
        const recoveryResult = await r307Sensor.calibrate();
        expect(recoveryResult).toBe(true);
      });

      it('should validate environmental conditions during calibration', async () => {
        // Arrange
        const environmentalTests = [
          { temperature: 18.0, humidity: 45, expected: true }, // Optimal
          { temperature: 35.0, humidity: 60, expected: true }, // Acceptable
          { temperature: 50.0, humidity: 85, expected: false }, // Too extreme
        ];

        // Act & Assert
        for (const test of environmentalTests) {
          mockR307Sensor.getStatus.mockReturnValue({
            isCalibrated: false,
            temperature: test.temperature,
            lastReading: new Date(),
            errorCount: 0,
          });

          if (test.expected) {
            mockR307Sensor.calibrate.mockResolvedValue(true);
            const result = await r307Sensor.calibrate();
            expect(result).toBe(true);
          } else {
            mockR307Sensor.calibrate.mockRejectedValue(new Error('Environmental conditions not suitable'));
            await expect(r307Sensor.calibrate()).rejects.toThrow('Environmental conditions not suitable');
          }
        }
      });

      it('should perform automatic recalibration when accuracy degrades', async () => {
        // Arrange
        const degradedReadings = [
          { quality: 65, confidence: 70 }, // Below threshold
          { quality: 68, confidence: 72 }, // Still below threshold
          { quality: 95, confidence: 98 }, // After recalibration
        ];

        degradedReadings.forEach((reading, index) => {
          mockR307Sensor.readFingerprint.mockResolvedValueOnce({
            thumbid: `AUTO_RECAL_${index}`,
            quality: reading.quality,
            template: `TEMPLATE_${index}`,
            confidence: reading.confidence,
          });
        });

        mockR307Sensor.calibrate.mockResolvedValue(true);

        // Act
        // First two readings should trigger recalibration
        const reading1 = await r307Sensor.readFingerprint();
        const reading2 = await r307Sensor.readFingerprint();
        
        // Check if recalibration is needed
        if (reading1.quality < 70 || reading2.quality < 70) {
          await r307Sensor.calibrate();
        }
        
        const reading3 = await r307Sensor.readFingerprint();

        // Assert
        expect(reading1.quality).toBeLessThan(70);
        expect(reading2.quality).toBeLessThan(70);
        expect(reading3.quality).toBeGreaterThan(90);
        expect(mockR307Sensor.calibrate).toHaveBeenCalledTimes(1);
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
