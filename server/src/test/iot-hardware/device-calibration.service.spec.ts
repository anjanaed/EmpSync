import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

interface DeviceCalibrationService {
  calibrateDevice(deviceId: string, parameters: CalibrationParameters): Promise<CalibrationResult>;
  validateCalibration(deviceId: string): Promise<ValidationResult>;
  resetCalibration(deviceId: string): Promise<boolean>;
  getCalibrationHistory(deviceId: string): Promise<CalibrationHistory[]>;
  performAutoCalibration(deviceId: string): Promise<AutoCalibrationResult>;
  getCalibrationStatus(deviceId: string): CalibrationStatus;
}

interface CalibrationParameters {
  sensitivity: number;
  threshold: number;
  baseline: number;
  samplingRate: number;
  temperatureCompensation: boolean;
  environmentalFactors: EnvironmentalFactors;
}

interface EnvironmentalFactors {
  temperature: number;
  humidity: number;
  lighting: number;
  pressure: number;
}

interface CalibrationResult {
  success: boolean;
  deviceId: string;
  calibrationId: string;
  parameters: CalibrationParameters;
  timestamp: Date;
  accuracy: number;
  deviations: Deviation[];
  recommendations: string[];
}

interface ValidationResult {
  isValid: boolean;
  accuracy: number;
  confidence: number;
  issues: CalibrationIssue[];
  recommendation: string;
  nextCalibrationDue: Date;
}

interface CalibrationHistory {
  calibrationId: string;
  timestamp: Date;
  parameters: CalibrationParameters;
  success: boolean;
  accuracy: number;
  performedBy: string;
}

interface AutoCalibrationResult {
  completed: boolean;
  iterations: number;
  finalAccuracy: number;
  adjustments: ParameterAdjustment[];
  timeElapsed: number;
}

interface CalibrationStatus {
  lastCalibrated: Date;
  isCalibrated: boolean;
  accuracy: number;
  driftDetected: boolean;
  nextMaintenanceDue: Date;
  status: 'optimal' | 'needs_attention' | 'critical';
}

interface Deviation {
  parameter: string;
  expected: number;
  actual: number;
  tolerance: number;
  withinTolerance: boolean;
}

interface CalibrationIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  solution: string;
}

interface ParameterAdjustment {
  parameter: string;
  originalValue: number;
  adjustedValue: number;
  reason: string;
  improvement: number;
}

describe('Device Calibration Test Cases', () => {
  let calibrationService: DeviceCalibrationService;

  const mockCalibrationService = {
    calibrateDevice: jest.fn(),
    validateCalibration: jest.fn(),
    resetCalibration: jest.fn(),
    getCalibrationHistory: jest.fn(),
    performAutoCalibration: jest.fn(),
    getCalibrationStatus: jest.fn(),
  };

  const mockEnvironmentalSensor = {
    getCurrentConditions: jest.fn(),
    monitorStability: jest.fn(),
    adjustForEnvironment: jest.fn(),
  };

  const mockDeviceManager = {
    getDeviceInfo: jest.fn(),
    isDeviceReady: jest.fn(),
    getDeviceCapabilities: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'DeviceCalibrationService', useValue: mockCalibrationService },
        { provide: 'EnvironmentalSensor', useValue: mockEnvironmentalSensor },
        { provide: 'DeviceManager', useValue: mockDeviceManager },
      ],
    }).compile();

    calibrationService = module.get<DeviceCalibrationService>('DeviceCalibrationService');

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Test Case: Device Calibration - Sensor Calibration and Accuracy Validation', () => {
    it('should perform complete device calibration with optimal parameters', async () => {
      // Arrange
      const deviceId = 'ESP32_R307_001';
      const calibrationParams: CalibrationParameters = {
        sensitivity: 85,
        threshold: 70,
        baseline: 128,
        samplingRate: 500,
        temperatureCompensation: true,
        environmentalFactors: {
          temperature: 23.5,
          humidity: 45,
          lighting: 800,
          pressure: 1013.25,
        },
      };

      const expectedResult: CalibrationResult = {
        success: true,
        deviceId,
        calibrationId: 'CAL_2024_001',
        parameters: calibrationParams,
        timestamp: new Date(),
        accuracy: 98.5,
        deviations: [],
        recommendations: ['Monitor temperature variations', 'Schedule next calibration in 30 days'],
      };

      mockCalibrationService.calibrateDevice.mockResolvedValue(expectedResult);
      mockEnvironmentalSensor.getCurrentConditions.mockResolvedValue({
        stable: true,
        temperature: 23.5,
        humidity: 45,
        lighting: 800,
        pressure: 1013.25,
      });
      mockDeviceManager.isDeviceReady.mockResolvedValue(true);

      // Act
      const conditions = await mockEnvironmentalSensor.getCurrentConditions();
      const deviceReady = await mockDeviceManager.isDeviceReady(deviceId);
      const calibrationResult = await calibrationService.calibrateDevice(deviceId, calibrationParams);

      // Assert
      expect(conditions.stable).toBe(true);
      expect(deviceReady).toBe(true);
      expect(calibrationResult.success).toBe(true);
      expect(calibrationResult.accuracy).toBeGreaterThan(95);
      expect(calibrationResult.deviations).toHaveLength(0);
      expect(calibrationResult.parameters.sensitivity).toBe(85);
      expect(calibrationResult.parameters.threshold).toBe(70);
      expect(calibrationResult.recommendations).toContain('Monitor temperature variations');

      expect(mockCalibrationService.calibrateDevice).toHaveBeenCalledWith(deviceId, calibrationParams);
      expect(mockEnvironmentalSensor.getCurrentConditions).toHaveBeenCalledTimes(1);
      expect(mockDeviceManager.isDeviceReady).toHaveBeenCalledWith(deviceId);
    });

    it('should validate calibration accuracy and detect deviations', async () => {
      // Arrange
      const deviceId = 'ESP32_R307_002';
      const validationResult: ValidationResult = {
        isValid: true,
        accuracy: 97.2,
        confidence: 96.8,
        issues: [],
        recommendation: 'Calibration is optimal',
        nextCalibrationDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      const calibrationStatus: CalibrationStatus = {
        lastCalibrated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isCalibrated: true,
        accuracy: 97.2,
        driftDetected: false,
        nextMaintenanceDue: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'optimal',
      };

      mockCalibrationService.validateCalibration.mockResolvedValue(validationResult);
      mockCalibrationService.getCalibrationStatus.mockReturnValue(calibrationStatus);

      // Act
      const validation = await calibrationService.validateCalibration(deviceId);
      const status = calibrationService.getCalibrationStatus(deviceId);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.accuracy).toBeGreaterThan(95);
      expect(validation.confidence).toBeGreaterThan(95);
      expect(validation.issues).toHaveLength(0);
      expect(validation.recommendation).toBe('Calibration is optimal');

      expect(status.isCalibrated).toBe(true);
      expect(status.driftDetected).toBe(false);
      expect(status.status).toBe('optimal');
      expect(status.accuracy).toBeCloseTo(97.2, 1);

      expect(mockCalibrationService.validateCalibration).toHaveBeenCalledWith(deviceId);
      expect(mockCalibrationService.getCalibrationStatus).toHaveBeenCalledWith(deviceId);
    });

    it('should handle calibration with environmental compensation', async () => {
      // Arrange
      const deviceId = 'ESP32_R307_003';
      const challengingEnvironment: EnvironmentalFactors = {
        temperature: 35.0, // Higher temperature
        humidity: 75,      // Higher humidity
        lighting: 200,     // Lower lighting
        pressure: 995.0,   // Lower pressure
      };

      const compensatedParams: CalibrationParameters = {
        sensitivity: 90,   // Increased for challenging conditions
        threshold: 75,     // Adjusted threshold
        baseline: 135,     // Adjusted baseline
        samplingRate: 750, // Increased sampling rate
        temperatureCompensation: true,
        environmentalFactors: challengingEnvironment,
      };

      const compensatedResult: CalibrationResult = {
        success: true,
        deviceId,
        calibrationId: 'CAL_2024_002_COMP',
        parameters: compensatedParams,
        timestamp: new Date(),
        accuracy: 94.8, // Slightly lower due to challenging conditions
        deviations: [
          {
            parameter: 'sensitivity',
            expected: 85,
            actual: 90,
            tolerance: 10,
            withinTolerance: true,
          },
        ],
        recommendations: [
          'Environmental compensation applied',
          'Monitor humidity levels',
          'Consider improved ventilation',
        ],
      };

      mockEnvironmentalSensor.getCurrentConditions.mockResolvedValue({
        stable: true,
        ...challengingEnvironment,
      });
      mockEnvironmentalSensor.adjustForEnvironment.mockResolvedValue(compensatedParams);
      mockCalibrationService.calibrateDevice.mockResolvedValue(compensatedResult);

      // Act
      const environment = await mockEnvironmentalSensor.getCurrentConditions();
      const adjustedParams = await mockEnvironmentalSensor.adjustForEnvironment(compensatedParams);
      const calibrationResult = await calibrationService.calibrateDevice(deviceId, adjustedParams);

      // Assert
      expect(environment.temperature).toBe(35.0);
      expect(environment.humidity).toBe(75);
      expect(adjustedParams.temperatureCompensation).toBe(true);
      expect(calibrationResult.accuracy).toBeGreaterThan(90);
      expect(calibrationResult.deviations).toHaveLength(1);
      expect(calibrationResult.deviations[0].withinTolerance).toBe(true);
      expect(calibrationResult.recommendations).toContain('Environmental compensation applied');

      expect(mockEnvironmentalSensor.adjustForEnvironment).toHaveBeenCalledWith(compensatedParams);
    });

    it('should perform automatic calibration with iterative improvements', async () => {
      // Arrange
      const deviceId = 'ESP32_R307_004';
      const autoCalibrationResult: AutoCalibrationResult = {
        completed: true,
        iterations: 4,
        finalAccuracy: 97.8,
        adjustments: [
          {
            parameter: 'sensitivity',
            originalValue: 80,
            adjustedValue: 87,
            reason: 'Improved signal detection',
            improvement: 2.3,
          },
          {
            parameter: 'threshold',
            originalValue: 65,
            adjustedValue: 72,
            reason: 'Reduced false positives',
            improvement: 1.8,
          },
          {
            parameter: 'baseline',
            originalValue: 120,
            adjustedValue: 130,
            reason: 'Environmental compensation',
            improvement: 1.2,
          },
        ],
        timeElapsed: 45000, // 45 seconds
      };

      mockCalibrationService.performAutoCalibration.mockResolvedValue(autoCalibrationResult);
      mockDeviceManager.getDeviceCapabilities.mockResolvedValue({
        supportsAutoCalibration: true,
        maxIterations: 10,
        accuracyTarget: 95.0,
      });

      // Act
      const capabilities = await mockDeviceManager.getDeviceCapabilities(deviceId);
      const autoResult = await calibrationService.performAutoCalibration(deviceId);

      // Assert
      expect(capabilities.supportsAutoCalibration).toBe(true);
      expect(autoResult.completed).toBe(true);
      expect(autoResult.finalAccuracy).toBeGreaterThan(95);
      expect(autoResult.iterations).toBeLessThanOrEqual(capabilities.maxIterations);
      expect(autoResult.adjustments).toHaveLength(3);
      expect(autoResult.timeElapsed).toBeLessThan(60000); // Less than 1 minute

      // Verify improvements were made
      autoResult.adjustments.forEach(adjustment => {
        expect(adjustment.improvement).toBeGreaterThan(0);
        expect(adjustment.adjustedValue).not.toBe(adjustment.originalValue);
      });

      expect(mockCalibrationService.performAutoCalibration).toHaveBeenCalledWith(deviceId);
    });

    it('should handle calibration failures and provide diagnostics', async () => {
      // Arrange
      const deviceId = 'ESP32_R307_005';
      const failedCalibrationParams: CalibrationParameters = {
        sensitivity: 95, // Too high
        threshold: 90,   // Too high
        baseline: 150,   // Too high
        samplingRate: 1000,
        temperatureCompensation: false,
        environmentalFactors: {
          temperature: 45.0, // Too hot
          humidity: 90,      // Too humid
          lighting: 50,      // Too dark
          pressure: 980.0,
        },
      };

      const failedResult: CalibrationResult = {
        success: false,
        deviceId,
        calibrationId: 'CAL_2024_003_FAIL',
        parameters: failedCalibrationParams,
        timestamp: new Date(),
        accuracy: 65.2, // Poor accuracy
        deviations: [
          {
            parameter: 'sensitivity',
            expected: 85,
            actual: 95,
            tolerance: 5,
            withinTolerance: false,
          },
          {
            parameter: 'threshold',
            expected: 70,
            actual: 90,
            tolerance: 10,
            withinTolerance: false,
          },
        ],
        recommendations: [
          'Reduce sensitivity and threshold values',
          'Improve environmental conditions',
          'Enable temperature compensation',
          'Increase lighting levels',
          'Reduce humidity levels',
        ],
      };

      const validationWithIssues: ValidationResult = {
        isValid: false,
        accuracy: 65.2,
        confidence: 58.5,
        issues: [
          {
            type: 'parameter_out_of_range',
            severity: 'high',
            description: 'Sensitivity and threshold values exceed recommended limits',
            impact: 'Poor accuracy and high false positive rate',
            solution: 'Adjust parameters within recommended ranges',
          },
          {
            type: 'environmental_conditions',
            severity: 'medium',
            description: 'Environmental conditions not optimal for calibration',
            impact: 'Reduced accuracy and stability',
            solution: 'Improve temperature, humidity, and lighting conditions',
          },
        ],
        recommendation: 'Recalibrate with corrected parameters and improved environment',
        nextCalibrationDue: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      };

      mockEnvironmentalSensor.getCurrentConditions.mockResolvedValue({
        stable: false,
        temperature: 45.0,
        humidity: 90,
        lighting: 50,
        pressure: 980.0,
      });
      mockCalibrationService.calibrateDevice.mockResolvedValue(failedResult);
      mockCalibrationService.validateCalibration.mockResolvedValue(validationWithIssues);

      // Act
      const environment = await mockEnvironmentalSensor.getCurrentConditions();
      const calibrationResult = await calibrationService.calibrateDevice(deviceId, failedCalibrationParams);
      const validation = await calibrationService.validateCalibration(deviceId);

      // Assert
      expect(environment.stable).toBe(false);
      expect(calibrationResult.success).toBe(false);
      expect(calibrationResult.accuracy).toBeLessThan(70);
      expect(calibrationResult.deviations.every(d => !d.withinTolerance)).toBe(true);
      expect(calibrationResult.recommendations).toContain('Reduce sensitivity and threshold values');

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toHaveLength(2);
      expect(validation.issues.some(i => i.severity === 'high')).toBe(true);
      expect(validation.recommendation).toContain('Recalibrate');

      expect(mockCalibrationService.calibrateDevice).toHaveBeenCalledWith(deviceId, failedCalibrationParams);
    });

    it('should track calibration history and trends', async () => {
      // Arrange
      const deviceId = 'ESP32_R307_006';
      const calibrationHistory: CalibrationHistory[] = [
        {
          calibrationId: 'CAL_2024_001',
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          parameters: { sensitivity: 85, threshold: 70, baseline: 128, samplingRate: 500, temperatureCompensation: true, environmentalFactors: { temperature: 23, humidity: 45, lighting: 800, pressure: 1013 } },
          success: true,
          accuracy: 98.2,
          performedBy: 'system_auto',
        },
        {
          calibrationId: 'CAL_2024_002',
          timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          parameters: { sensitivity: 87, threshold: 72, baseline: 130, samplingRate: 500, temperatureCompensation: true, environmentalFactors: { temperature: 25, humidity: 50, lighting: 750, pressure: 1010 } },
          success: true,
          accuracy: 97.8,
          performedBy: 'admin_user',
        },
        {
          calibrationId: 'CAL_2024_003',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
          parameters: { sensitivity: 88, threshold: 73, baseline: 132, samplingRate: 500, temperatureCompensation: true, environmentalFactors: { temperature: 24, humidity: 48, lighting: 780, pressure: 1015 } },
          success: true,
          accuracy: 97.5,
          performedBy: 'system_auto',
        },
      ];

      mockCalibrationService.getCalibrationHistory.mockResolvedValue(calibrationHistory);

      // Act
      const history = await calibrationService.getCalibrationHistory(deviceId);

      // Assert
      expect(history).toHaveLength(3);
      expect(history.every(h => h.success)).toBe(true);
      
      // Check accuracy trend (should be stable)
      const accuracies = history.map(h => h.accuracy);
      expect(accuracies.every(a => a > 97)).toBe(true);
      
      // Check calibration frequency (every ~15 days)
      const timestamps = history.map(h => h.timestamp.getTime());
      const intervals = [];
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push(timestamps[i] - timestamps[i - 1]);
      }
      expect(intervals.every(interval => interval > 10 * 24 * 60 * 60 * 1000)).toBe(true); // At least 10 days apart

      // Check parameter stability
      const sensitivities = history.map(h => h.parameters.sensitivity);
      const maxSensitivity = Math.max(...sensitivities);
      const minSensitivity = Math.min(...sensitivities);
      expect(maxSensitivity - minSensitivity).toBeLessThan(5); // Small drift

      expect(mockCalibrationService.getCalibrationHistory).toHaveBeenCalledWith(deviceId);
    });

    it('should handle calibration reset and re-initialization', async () => {
      // Arrange
      const deviceId = 'ESP32_R307_007';
      const originalStatus: CalibrationStatus = {
        lastCalibrated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        isCalibrated: true,
        accuracy: 85.2, // Degraded accuracy
        driftDetected: true,
        nextMaintenanceDue: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Overdue
        status: 'critical',
      };

      const postResetStatus: CalibrationStatus = {
        lastCalibrated: new Date(),
        isCalibrated: false,
        accuracy: 0,
        driftDetected: false,
        nextMaintenanceDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'optimal',
      };

      const newCalibrationParams: CalibrationParameters = {
        sensitivity: 85,
        threshold: 70,
        baseline: 128,
        samplingRate: 500,
        temperatureCompensation: true,
        environmentalFactors: {
          temperature: 23.0,
          humidity: 45,
          lighting: 800,
          pressure: 1013.25,
        },
      };

      const reCalibrationResult: CalibrationResult = {
        success: true,
        deviceId,
        calibrationId: 'CAL_2024_RESET_001',
        parameters: newCalibrationParams,
        timestamp: new Date(),
        accuracy: 98.1,
        deviations: [],
        recommendations: ['Reset successful', 'Device performance restored'],
      };

      mockCalibrationService.getCalibrationStatus
        .mockReturnValueOnce(originalStatus)
        .mockReturnValueOnce(postResetStatus);
      mockCalibrationService.resetCalibration.mockResolvedValue(true);
      mockCalibrationService.calibrateDevice.mockResolvedValue(reCalibrationResult);

      // Act
      const beforeResetStatus = calibrationService.getCalibrationStatus(deviceId);
      const resetSuccess = await calibrationService.resetCalibration(deviceId);
      const afterResetStatus = calibrationService.getCalibrationStatus(deviceId);
      const newCalibration = await calibrationService.calibrateDevice(deviceId, newCalibrationParams);

      // Assert
      expect(beforeResetStatus.status).toBe('critical');
      expect(beforeResetStatus.driftDetected).toBe(true);
      expect(beforeResetStatus.accuracy).toBeLessThan(90);

      expect(resetSuccess).toBe(true);

      expect(afterResetStatus.isCalibrated).toBe(false);
      expect(afterResetStatus.driftDetected).toBe(false);
      expect(afterResetStatus.accuracy).toBe(0);

      expect(newCalibration.success).toBe(true);
      expect(newCalibration.accuracy).toBeGreaterThan(95);
      expect(newCalibration.recommendations).toContain('Reset successful');

      expect(mockCalibrationService.resetCalibration).toHaveBeenCalledWith(deviceId);
      expect(mockCalibrationService.calibrateDevice).toHaveBeenCalledWith(deviceId, newCalibrationParams);
    });

    it('should monitor long-term calibration stability and drift', async () => {
      // Arrange
      const deviceId = 'ESP32_R307_008';
      const longTermHistory: CalibrationHistory[] = [];
      
      // Generate 12 months of calibration history with gradual drift
      for (let i = 0; i < 12; i++) {
        const daysAgo = (11 - i) * 30; // Every 30 days
        const drift = i * 0.3; // Gradual accuracy decline
        
        longTermHistory.push({
          calibrationId: `CAL_2024_MONTH_${i + 1}`,
          timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          parameters: {
            sensitivity: 85 + drift,
            threshold: 70 + drift,
            baseline: 128,
            samplingRate: 500,
            temperatureCompensation: true,
            environmentalFactors: { temperature: 23, humidity: 45, lighting: 800, pressure: 1013 }
          },
          success: true,
          accuracy: 98.5 - drift,
          performedBy: i % 2 === 0 ? 'system_auto' : 'admin_user',
        });
      }

      const currentStatus: CalibrationStatus = {
        lastCalibrated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isCalibrated: true,
        accuracy: 95.2, // Still acceptable but showing drift
        driftDetected: true,
        nextMaintenanceDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'needs_attention',
      };

      mockCalibrationService.getCalibrationHistory.mockResolvedValue(longTermHistory);
      mockCalibrationService.getCalibrationStatus.mockReturnValue(currentStatus);

      // Act
      const history = await calibrationService.getCalibrationHistory(deviceId);
      const status = calibrationService.getCalibrationStatus(deviceId);

      // Assert
      expect(history).toHaveLength(12);
      
      // Analyze accuracy trend
      const accuracies = history.map(h => h.accuracy);
      const firstAccuracy = accuracies[0];
      const lastAccuracy = accuracies[accuracies.length - 1];
      const totalDrift = firstAccuracy - lastAccuracy;
      
      expect(totalDrift).toBeGreaterThan(0); // Accuracy has decreased
      expect(totalDrift).toBeLessThan(5); // But not drastically
      expect(lastAccuracy).toBeGreaterThan(95); // Still within acceptable range

      // Check parameter adjustments over time
      const sensitivities = history.map(h => h.parameters.sensitivity);
      const sensitivityIncrease = sensitivities[sensitivities.length - 1] - sensitivities[0];
      expect(sensitivityIncrease).toBeGreaterThan(0); // Parameters adjusted to compensate

      expect(status.driftDetected).toBe(true);
      expect(status.status).toBe('needs_attention');
      expect(status.accuracy).toBeGreaterThan(95);

      expect(mockCalibrationService.getCalibrationHistory).toHaveBeenCalledWith(deviceId);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
