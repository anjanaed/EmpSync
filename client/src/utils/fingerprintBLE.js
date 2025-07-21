/**
 * Web Bluetooth API utility for ESP32 fingerprint communication
 * Compatible with Android Chrome and all modern browsers that support Web Bluetooth
 */

class FingerprintBLE {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.isConnected = false;
    this.onDataCallback = null;
    this.onConnectionChangeCallback = null;
    
    // BLE Service and Characteristic UUIDs (must match ESP32 firmware)
    this.SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
    this.CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321';
  }

  /**
   * Check if Web Bluetooth is supported
   */
  isSupported() {
    return 'bluetooth' in navigator;
  }

  /**
   * Connect to ESP32 fingerprint device
   */
  async connect() {
    try {
      if (!this.isSupported()) {
        throw new Error('Web Bluetooth is not supported in this browser');
      }

      console.log('Requesting Bluetooth Device...');
      
      // Request device with our service UUID
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: 'ESP32_Fingerprint_BLE' },
          { services: [this.SERVICE_UUID] }
        ],
        optionalServices: [this.SERVICE_UUID]
      });

      console.log('Bluetooth Device found:', this.device.name);

      // Add disconnection listener
      this.device.addEventListener('gattserverdisconnected', () => {
        console.log('Bluetooth Device disconnected');
        this.isConnected = false;
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(false);
        }
      });

      // Connect to GATT server
      console.log('Connecting to GATT Server...');
      this.server = await this.device.gatt.connect();

      // Get the service
      console.log('Getting Service...');
      this.service = await this.server.getPrimaryService(this.SERVICE_UUID);

      // Get the characteristic
      console.log('Getting Characteristic...');
      this.characteristic = await this.service.getCharacteristic(this.CHARACTERISTIC_UUID);

      // Set up notifications
      console.log('Setting up notifications...');
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = new TextDecoder().decode(event.target.value);
        console.log('BLE Data received:', value);
        if (this.onDataCallback) {
          this.onDataCallback(value);
        }
      });

      // Give the connection a moment to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));

      this.isConnected = true;
      console.log('✅ BLE Connection established successfully');
      console.log('Characteristic properties:', {
        read: this.characteristic.properties.read,
        write: this.characteristic.properties.write,
        writeWithoutResponse: this.characteristic.properties.writeWithoutResponse,
        notify: this.characteristic.properties.notify
      });
      
      if (this.onConnectionChangeCallback) {
        this.onConnectionChangeCallback(true);
      }

      return true;
    } catch (error) {
      console.error('❌ BLE Connection failed:', error);
      this.isConnected = false;
      if (this.onConnectionChangeCallback) {
        this.onConnectionChangeCallback(false);
      }
      throw error;
    }
  }

  /**
   * Disconnect from the device
   */
  async disconnect() {
    try {
      if (this.device && this.device.gatt.connected) {
        await this.device.gatt.disconnect();
      }
      this.isConnected = false;
      console.log('BLE Device disconnected');
      
      if (this.onConnectionChangeCallback) {
        this.onConnectionChangeCallback(false);
      }
    } catch (error) {
      console.error('Error disconnecting BLE device:', error);
    }
  }

  /**
   * Send command to ESP32 with enhanced error handling and retry logic
   */
  async sendCommand(command, retries = 2) {
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (!this.isConnected || !this.characteristic) {
          throw new Error('Device not connected');
        }

        // Add a small delay to ensure the characteristic is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        const encoder = new TextEncoder();
        const data = encoder.encode(command);
        
        console.log(`Sending BLE command (attempt ${attempt + 1}/${retries + 1}):`, command);
        
        // Check if characteristic supports write with response
        if (this.characteristic.properties.writeWithoutResponse) {
          await this.characteristic.writeValueWithoutResponse(data);
        } else {
          await this.characteristic.writeValue(data);
        }
        
        return true;
      } catch (error) {
        lastError = error;
        console.error(`Error sending BLE command (attempt ${attempt + 1}):`, error);
        
        if (attempt < retries) {
          console.log(`Retrying command "${command}" in 500ms...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Send command and wait for specific response pattern
   */
  async sendCommandAndWaitForResponse(command, responsePattern, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout waiting for response to command: ${command}`));
      }, timeout);

      // Store original callback
      const originalCallback = this.onDataCallback;
      
      // Set temporary callback to wait for response
      this.onData((data) => {
        // Still call original callback
        if (originalCallback) {
          originalCallback(data);
        }
        
        // Check if response matches pattern
        if (data.includes(responsePattern)) {
          clearTimeout(timeoutId);
          // Restore original callback
          this.onData(originalCallback);
          resolve(data);
        }
      });

      // Send the command
      this.sendCommand(command).catch(error => {
        clearTimeout(timeoutId);
        this.onData(originalCallback);
        reject(error);
      });
    });
  }

  /**
   * Set callback for incoming data
   */
  onData(callback) {
    this.onDataCallback = callback;
  }

  /**
   * Set callback for connection state changes
   */
  onConnectionChange(callback) {
    this.onConnectionChangeCallback = callback;
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Get device info
   */
  getDeviceInfo() {
    if (this.device) {
      return {
        name: this.device.name,
        id: this.device.id,
        connected: this.isConnected
      };
    }
    return null;
  }

  /**
   * Test BLE connection with a simple command
   */
  async testConnection() {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected');
      }
      
      // Try sending a simple command to test the connection
      await this.sendCommand("SCAN");
      console.log('BLE connection test successful');
      return true;
    } catch (error) {
      console.error('BLE connection test failed:', error);
      return false;
    }
  }
}

// Export for use in React components
window.FingerprintBLE = FingerprintBLE;

export default FingerprintBLE;
