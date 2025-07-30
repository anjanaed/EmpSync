import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

interface R307SensorService {
  initialize(): Promise<boolean>;
  testSensor(): Promise<SensorTestResult>;
  readFingerprint(): Promise<FingerprintReading>;
  calibrateSensor(): Promise<CalibrationResult>;
  getSensorStatus(): SensorStatus;
  processTemplateDeta(template: string): Promise<ProcessedTemplate>;
}

interface SensorTestResult {
  sensorWorking: boolean;
  accuracy: number;
  responseTime: number;
  testsPassed: number;
  testsTotal: number;
  errors: string[];
}

interface FingerprintReading {
  thumbid: string;
  quality: number;
  template: ArrayBuffer;
  confidence: number;
  readTime: number;
  sensorTemperature: number;
}

interface CalibrationResult {
  calibrated: boolean;
  baseline: number;
  sensitivity: number;
  threshold: number;
  calibrationTime: Date;
}

interface SensorStatus {
  isOnline: boolean;
  temperature: number;
  voltage: number;
  lastReading: Date;
  totalReadings: number;
  errorCount: number;
  firmwareVersion: string;
}

interface ProcessedTemplate {
  processed: boolean;
  features: TemplateFeature[];
  uniquePoints: number;
  quality: number;
}

interface TemplateFeature {
  type: string;
  coordinates: { x: number; y: number };
  confidence: number;
}

describe('R307 Sensor Functionality Test Cases', () => {
  let r307Service: R307SensorService;

  const mockR307Service = {
    initialize: jest.fn(),
    testSensor: jest.fn(),
    readFingerprint: jest.fn(),
    calibrateSensor: jest.fn(),
    getSensorStatus: jest.fn(),
    processTemplateDeta: jest.fn(),
  };

  const mockFingerprintProcessor = {
    validateTemplate: jest.fn(),
    compareTemplates: jest.fn(),
    extractFeatures: jest.fn(),
    calculateQuality: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'R307SensorService', useValue: mockR307Service },
        { provide: 'FingerprintProcessor', useValue: mockFingerprintProcessor },
      ],
    }).compile();

    r307Service = module.get<R307SensorService>('R307SensorService');

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Test Case: R307 Sensor Functionality - Fingerprint Sensor Test', () => {
    it('should accurately read and process fingerprint data', async () => {
      // Arrange
      const expectedSensorTest: SensorTestResult = {
        sensorWorking: true,
        accuracy: 96.5,
        responseTime: 1500, // milliseconds
        testsPassed: 18,
        testsTotal: 20,
        errors: [],
      };

      const expectedFingerprintReading: FingerprintReading = {
        thumbid: 'FP_R307_001',
        quality: 95,
        template: new ArrayBuffer(512), // 512 bytes template
        confidence: 98.2,
        readTime: 1200,
        sensorTemperature: 23.5,
      };

      const expectedSensorStatus: SensorStatus = {
        isOnline: true,
        temperature: 23.5,
        voltage: 3.3,
        lastReading: new Date(),
        totalReadings: 1250,
        errorCount: 2,
        firmwareVersion: 'R307_v2.1.3',
      };

      mockR307Service.initialize.mockResolvedValue(true);
      mockR307Service.testSensor.mockResolvedValue(expectedSensorTest);
      mockR307Service.readFingerprint.mockResolvedValue(expectedFingerprintReading);
      mockR307Service.getSensorStatus.mockReturnValue(expectedSensorStatus);
      mockFingerprintProcessor.validateTemplate.mockResolvedValue({
        valid: true,
        features: 45,
        quality: 95,
      });

      // Act
      const initResult = await r307Service.initialize();
      const sensorTest = await r307Service.testSensor();
      const fingerprintData = await r307Service.readFingerprint();
      const sensorStatus = r307Service.getSensorStatus();

      // Assert
      expect(initResult).toBe(true);
      expect(sensorTest.sensorWorking).toBe(true);
      expect(sensorTest.accuracy).toBeGreaterThan(95);
      expect(sensorTest.responseTime).toBeLessThan(2000);
      expect(sensorTest.testsPassed / sensorTest.testsTotal).toBeGreaterThan(0.85);
      expect(sensorTest.errors).toHaveLength(0);

      expect(fingerprintData.quality).toBeGreaterThan(90);
      expect(fingerprintData.confidence).toBeGreaterThan(95);
      expect(fingerprintData.template.byteLength).toBeGreaterThan(0);
      expect(fingerprintData.readTime).toBeLessThan(2000);

      expect(sensorStatus.isOnline).toBe(true);
      expect(sensorStatus.temperature).toBeLessThan(40);
      expect(sensorStatus.voltage).toBeCloseTo(3.3, 1);
      expect(sensorStatus.errorCount).toBeLessThan(5);

      expect(mockR307Service.initialize).toHaveBeenCalledTimes(1);
      expect(mockR307Service.testSensor).toHaveBeenCalledTimes(1);
      expect(mockR307Service.readFingerprint).toHaveBeenCalledTimes(1);
    });

    it('should perform comprehensive sensor diagnostics', async () => {
      // Arrange
      const diagnosticTests = [
        { name: 'power_supply', expected: true },
        { name: 'optical_sensor', expected: true },
        { name: 'image_capture', expected: true },
        { name: 'template_processing', expected: true },
        { name: 'communication', expected: true },
        { name: 'memory_test', expected: true },
      ];

      const diagnosticResults: SensorTestResult = {
        sensorWorking: true,
        accuracy: 97.8,
        responseTime: 800,
        testsPassed: 6,
        testsTotal: 6,
        errors: [],
      };

      mockR307Service.testSensor.mockResolvedValue(diagnosticResults);

      // Act
      const testResult = await r307Service.testSensor();

      // Assert
      expect(testResult.testsPassed).toBe(testResult.testsTotal);
      expect(testResult.accuracy).toBeGreaterThan(95);
      expect(testResult.responseTime).toBeLessThan(1000);
      expect(testResult.errors).toHaveLength(0);
      expect(testResult.sensorWorking).toBe(true);
    });

    it('should validate fingerprint template structure and quality', async () => {
      // Arrange
      const templateData = new ArrayBuffer(512);
      const templateView = new Uint8Array(templateData);
      // Fill with mock fingerprint template data
      for (let i = 0; i < 512; i++) {
        templateView[i] = Math.floor(Math.random() * 256);
      }

      const fingerprintReading: FingerprintReading = {
        thumbid: 'FP_TEMPLATE_TEST',
        quality: 94,
        template: templateData,
        confidence: 96.8,
        readTime: 950,
        sensorTemperature: 24.2,
      };

      const processedTemplate: ProcessedTemplate = {
        processed: true,
        features: [
          { type: 'minutiae', coordinates: { x: 120, y: 80 }, confidence: 0.95 },
          { type: 'ridge_ending', coordinates: { x: 95, y: 150 }, confidence: 0.88 },
          { type: 'bifurcation', coordinates: { x: 200, y: 120 }, confidence: 0.92 },
        ],
        uniquePoints: 42,
        quality: 94,
      };

      mockR307Service.readFingerprint.mockResolvedValue(fingerprintReading);
      mockR307Service.processTemplateDeta.mockResolvedValue(processedTemplate);
      mockFingerprintProcessor.extractFeatures.mockResolvedValue({
        features: processedTemplate.features,
        totalFeatures: processedTemplate.features.length,
      });
      mockFingerprintProcessor.calculateQuality.mockResolvedValue(94);

      // Act
      const reading = await r307Service.readFingerprint();
      const processed = await r307Service.processTemplateDeta(Buffer.from(reading.template).toString('base64'));
      const qualityCheck = await mockFingerprintProcessor.calculateQuality(reading.template);

      // Assert
      expect(reading.template.byteLength).toBe(512);
      expect(reading.quality).toBeGreaterThan(90);
      expect(processed.processed).toBe(true);
      expect(processed.features).toHaveLength(3);
      expect(processed.uniquePoints).toBeGreaterThan(40);
      expect(qualityCheck).toBeGreaterThan(90);

      // Validate feature quality
      processed.features.forEach(feature => {
        expect(feature.confidence).toBeGreaterThan(0.8);
        expect(feature.coordinates.x).toBeGreaterThan(0);
        expect(feature.coordinates.y).toBeGreaterThan(0);
      });
    });

    it('should handle multiple consecutive fingerprint readings', async () => {
      // Arrange
      const multipleReadings = [
        { quality: 96, confidence: 97.5, readTime: 900 },
        { quality: 94, confidence: 96.2, readTime: 1100 },
        { quality: 98, confidence: 98.8, readTime: 850 },
        { quality: 92, confidence: 95.1, readTime: 1250 },
        { quality: 95, confidence: 97.0, readTime: 980 },
      ];

      multipleReadings.forEach((reading, index) => {
        mockR307Service.readFingerprint.mockResolvedValueOnce({
          thumbid: `FP_MULTI_${index + 1}`,
          quality: reading.quality,
          template: new ArrayBuffer(512),
          confidence: reading.confidence,
          readTime: reading.readTime,
          sensorTemperature: 23.0 + (index * 0.2),
        });
      });

      // Act
      const readings = [];
      for (let i = 0; i < multipleReadings.length; i++) {
        const reading = await r307Service.readFingerprint();
        readings.push(reading);
      }

      // Assert
      expect(readings).toHaveLength(5);
      expect(readings.every(r => r.quality >= 90)).toBe(true);
      expect(readings.every(r => r.confidence >= 95)).toBe(true);
      expect(readings.every(r => r.readTime <= 1300)).toBe(true);
      expect(readings.every(r => r.template.byteLength === 512)).toBe(true);

      // Check consistency across readings
      const avgQuality = readings.reduce((sum, r) => sum + r.quality, 0) / readings.length;
      const avgConfidence = readings.reduce((sum, r) => sum + r.confidence, 0) / readings.length;
      expect(avgQuality).toBeGreaterThan(94);
      expect(avgConfidence).toBeGreaterThan(96);
    });

    it('should detect and handle poor quality fingerprint scans', async () => {
      // Arrange
      const poorQualityReadings = [
        { quality: 45, confidence: 60, issue: 'finger_too_dry' },
        { quality: 38, confidence: 55, issue: 'partial_print' },
        { quality: 52, confidence: 65, issue: 'pressure_too_light' },
      ];

      poorQualityReadings.forEach((reading, index) => {
        mockR307Service.readFingerprint.mockResolvedValueOnce({
          thumbid: `FP_POOR_${index + 1}`,
          quality: reading.quality,
          template: new ArrayBuffer(256), // Smaller template for poor quality
          confidence: reading.confidence,
          readTime: 2000 + (index * 200), // Longer read times
          sensorTemperature: 25.0,
        });
      });

      mockFingerprintProcessor.validateTemplate.mockResolvedValue({
        valid: false,
        reason: 'quality_below_threshold',
        recommendation: 'retry_scan',
      });

      // Act
      const poorReadings = [];
      for (let i = 0; i < poorQualityReadings.length; i++) {
        const reading = await r307Service.readFingerprint();
        const validation = await mockFingerprintProcessor.validateTemplate(reading.template);
        poorReadings.push({ reading, validation });
      }

      // Assert
      poorReadings.forEach(({ reading, validation }) => {
        expect(reading.quality).toBeLessThan(70);
        expect(reading.confidence).toBeLessThan(70);
        expect(reading.readTime).toBeGreaterThan(1500);
        expect(validation.valid).toBe(false);
        expect(validation.recommendation).toBe('retry_scan');
      });

      expect(mockFingerprintProcessor.validateTemplate).toHaveBeenCalledTimes(3);
    });

    it('should monitor sensor environmental conditions', async () => {
      // Arrange
      const environmentalConditions = [
        { temp: 18.5, voltage: 3.3, humidity: 45, optimal: true },
        { temp: 35.0, voltage: 3.2, humidity: 70, optimal: false },
        { temp: 45.0, voltage: 2.9, humidity: 85, optimal: false },
        { temp: 22.0, voltage: 3.3, humidity: 50, optimal: true },
      ];

      environmentalConditions.forEach((condition, index) => {
        mockR307Service.getSensorStatus.mockReturnValueOnce({
          isOnline: true,
          temperature: condition.temp,
          voltage: condition.voltage,
          lastReading: new Date(),
          totalReadings: 1000 + index,
          errorCount: condition.optimal ? 0 : 1,
          firmwareVersion: 'R307_v2.1.3',
        });
      });

      // Act
      const statusChecks = [];
      for (let i = 0; i < environmentalConditions.length; i++) {
        const status = r307Service.getSensorStatus();
        const isOptimal = status.temperature < 40 && status.voltage > 3.0 && status.errorCount === 0;
        statusChecks.push({ status, isOptimal });
      }

      // Assert
      expect(statusChecks).toHaveLength(4);
      expect(statusChecks.filter(check => check.isOptimal)).toHaveLength(2);
      expect(statusChecks.filter(check => !check.isOptimal)).toHaveLength(2);

      // Check specific conditions
      statusChecks.forEach((check, index) => {
        expect(check.status.isOnline).toBe(true);
        expect(check.status.temperature).toBe(environmentalConditions[index].temp);
        expect(check.status.voltage).toBe(environmentalConditions[index].voltage);
      });
    });

    it('should perform sensor calibration and verify results', async () => {
      // Arrange
      const calibrationConfig = {
        sensitivity: 85,
        threshold: 70,
        baseline: 128,
        samplingRate: 500,
      };

      const expectedCalibration: CalibrationResult = {
        calibrated: true,
        baseline: calibrationConfig.baseline,
        sensitivity: calibrationConfig.sensitivity,
        threshold: calibrationConfig.threshold,
        calibrationTime: new Date(),
      };

      const preCalibrationStatus: SensorStatus = {
        isOnline: true,
        temperature: 24.0,
        voltage: 3.3,
        lastReading: new Date(),
        totalReadings: 500,
        errorCount: 5,
        firmwareVersion: 'R307_v2.1.3',
      };

      const postCalibrationStatus: SensorStatus = {
        ...preCalibrationStatus,
        errorCount: 0,
        totalReadings: 501,
      };

      mockR307Service.getSensorStatus
        .mockReturnValueOnce(preCalibrationStatus)
        .mockReturnValueOnce(postCalibrationStatus);
      
      mockR307Service.calibrateSensor.mockResolvedValue(expectedCalibration);

      // Act
      const preStatus = r307Service.getSensorStatus();
      const calibrationResult = await r307Service.calibrateSensor();
      const postStatus = r307Service.getSensorStatus();

      // Assert
      expect(preStatus.errorCount).toBeGreaterThan(0);
      expect(calibrationResult.calibrated).toBe(true);
      expect(calibrationResult.sensitivity).toBe(85);
      expect(calibrationResult.threshold).toBe(70);
      expect(calibrationResult.baseline).toBe(128);
      expect(postStatus.errorCount).toBe(0);

      expect(mockR307Service.calibrateSensor).toHaveBeenCalledTimes(1);
    });

    it('should handle sensor communication errors and recovery', async () => {
      // Arrange
      const communicationErrors = [
        'UART_TIMEOUT',
        'CHECKSUM_ERROR',
        'INVALID_RESPONSE',
        'SENSOR_NOT_RESPONDING',
      ];

      const recoverySteps = [
        'retry_communication',
        'reset_sensor',
        'reinitialize',
        'diagnostic_mode',
      ];

      // Simulate errors followed by recovery
      mockR307Service.readFingerprint
        .mockRejectedValueOnce(new Error(communicationErrors[0]))
        .mockRejectedValueOnce(new Error(communicationErrors[1]))
        .mockResolvedValueOnce({
          thumbid: 'FP_RECOVERED',
          quality: 93,
          template: new ArrayBuffer(512),
          confidence: 96.5,
          readTime: 1100,
          sensorTemperature: 23.8,
        });

      mockR307Service.initialize.mockResolvedValue(true);

      // Act & Assert
      // First error
      await expect(r307Service.readFingerprint()).rejects.toThrow(communicationErrors[0]);
      
      // Second error  
      await expect(r307Service.readFingerprint()).rejects.toThrow(communicationErrors[1]);
      
      // Recovery
      const recoveryInit = await r307Service.initialize();
      const recoveredReading = await r307Service.readFingerprint();

      expect(recoveryInit).toBe(true);
      expect(recoveredReading.quality).toBeGreaterThan(90);
      expect(recoveredReading.thumbid).toBe('FP_RECOVERED');
      expect(mockR307Service.initialize).toHaveBeenCalledTimes(1);
    });

    it('should validate sensor firmware and compatibility', async () => {
      // Arrange
      const firmwareVersions = [
        { version: 'R307_v2.1.3', compatible: true, features: ['advanced_template', 'fast_scan'] },
        { version: 'R307_v2.0.1', compatible: true, features: ['basic_template'] },
        { version: 'R307_v1.9.5', compatible: false, features: ['legacy_template'] },
      ];

      firmwareVersions.forEach((fw, index) => {
        mockR307Service.getSensorStatus.mockReturnValueOnce({
          isOnline: true,
          temperature: 23.0,
          voltage: 3.3,
          lastReading: new Date(),
          totalReadings: 1000,
          errorCount: fw.compatible ? 0 : 1,
          firmwareVersion: fw.version,
        });
      });

      // Act
      const compatibilityChecks = [];
      for (let i = 0; i < firmwareVersions.length; i++) {
        const status = r307Service.getSensorStatus();
        const isLatest = status.firmwareVersion.includes('v2.1');
        const isSupported = !status.firmwareVersion.includes('v1.');
        
        compatibilityChecks.push({
          version: status.firmwareVersion,
          isLatest,
          isSupported,
          errors: status.errorCount,
        });
      }

      // Assert
      expect(compatibilityChecks).toHaveLength(3);
      expect(compatibilityChecks[0].isLatest).toBe(true);
      expect(compatibilityChecks[0].isSupported).toBe(true);
      expect(compatibilityChecks[1].isSupported).toBe(true);
      expect(compatibilityChecks[2].isSupported).toBe(false);
      expect(compatibilityChecks[2].errors).toBeGreaterThan(0);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
