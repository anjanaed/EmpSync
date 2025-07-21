/***************************************************
  Modified to work with R307 Fingerprint Sensor on ESP32
  using GPIO16 (RX) and GPIO17 (TX), with Bluetooth Low Energy (BLE)
  Supports continuous Scan, Enroll with auto-incrementing ID, Get IDs, Delete All, and Delete by ID commands
  Includes unit name (FPU001) in registration and scan messages
  Supports up to 1000 IDs for R307 sensor capacity
  Sends unit name and stored IDs on connection and on explicit UNIT_NAME command
  
  Web Bluetooth API Compatible - Works on Android Chrome and all modern browsers
****************************************************/

#include <Adafruit_Fingerprint.h>
#include <HardwareSerial.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Use HardwareSerial instance 1 on ESP32 for fingerprint sensor
HardwareSerial mySerial(1);  // UART1
#define RX_PIN 16
#define TX_PIN 17

// Unit name for this fingerprint unit
#define UNIT_NAME "FPU004"

// BLE UUIDs (Web Bluetooth compatible)
#define SERVICE_UUID        "12345678-1234-1234-1234-123456789abc"
#define CHARACTERISTIC_UUID "87654321-4321-4321-4321-cba987654321"

Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// Forward declarations
void sendBLEMessage(String message);
void sendTemplateIDs();
uint16_t getNextAvailableID();
void deleteAllFingerprints();
void deleteFingerprintByID(uint16_t id);
uint16_t getFingerprintID();
void getFingerprintEnroll();

// BLE variables
BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Current mode (0: Idle, 1: Scan, 2: Enroll, 3: Get IDs, 4: Delete All, 5: Delete by ID)
int mode = 1; // Start in Scan mode by default
uint16_t enroll_id = 0; // ID for enrollment
bool enrolling = false; // Flag for enrollment state
int enroll_step = 0; // Enrollment step (0: waiting, 1: first scan, 2: second scan)

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("BLE Client Connected");
      
      // Send unit name on connection
      String unitMsg = "UnitName: " + String(UNIT_NAME) + "\n";
      pCharacteristic->setValue(unitMsg.c_str());
      pCharacteristic->notify();
      
      // Don't send template IDs automatically - let client request them
      // This reduces the communication load on the fingerprint sensor
      Serial.println("Connection established. Client can request template IDs.");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("BLE Client Disconnected");
    }
};

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      String rxValue = String(pCharacteristic->getValue().c_str());
      
      if (rxValue.length() > 0) {
        rxValue.trim();
        Serial.println("Received BLE command: [" + rxValue + "]");
        
        if (rxValue == "SCAN") {
          mode = 1;
          Serial.println("Switched to Scan mode");
          sendBLEMessage("Switched to Scan mode");
        } else if (rxValue == "ENROLL") {
          mode = 2;
          enroll_id = getNextAvailableID();
          if (enroll_id > 0) {
            enrolling = true;
            enroll_step = 0;
            Serial.println("Switched to Enroll mode, ID: " + String(enroll_id));
            sendBLEMessage("Switched to Enroll mode, ID: " + String(enroll_id));
          } else {
            Serial.println("No available IDs for enrollment");
            sendBLEMessage("No available IDs for enrollment");
          }
        } else if (rxValue == "GET_IDS") {
          mode = 3;
          Serial.println("Switched to Get IDs mode");
          sendBLEMessage("Switched to Get IDs mode");
          sendTemplateIDs();
        } else if (rxValue == "DELETE_ALL") {
          mode = 4;
          Serial.println("Switched to Delete All mode");
          sendBLEMessage("Switched to Delete All mode");
          deleteAllFingerprints();
        } else if (rxValue.startsWith("DELETE_ID:")) {
          mode = 5;
          String idStr = rxValue.substring(10);
          uint16_t deleteId = idStr.toInt();
          Serial.println("Switched to Delete by ID mode, ID: " + String(deleteId));
          sendBLEMessage("Switched to Delete by ID mode, ID: " + String(deleteId));
          deleteFingerprintByID(deleteId);
        } else if (rxValue == "UNIT_NAME") {
          String unitMsg = "UnitName: " + String(UNIT_NAME);
          Serial.println(unitMsg);
          sendBLEMessage(unitMsg);
        }
      }
    }
};

void sendBLEMessage(String message) {
  if (deviceConnected) {
    String msg = message + "\n";
    pCharacteristic->setValue(msg.c_str());
    pCharacteristic->notify();
    delay(20); // Small delay to ensure delivery
  }
}

void setup() {
  // Initialize Serial Monitor for debugging
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n\nAdafruit Fingerprint Enroll, Scan, Get IDs, Delete All, and Delete by ID with BLE");
  Serial.print("Unit Name: "); Serial.println(UNIT_NAME);

  // Initialize BLE
  BLEDevice::init("ESP32_Fingerprint_BLE");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ |
                      BLECharacteristic::PROPERTY_WRITE |
                      BLECharacteristic::PROPERTY_WRITE_NR |
                      BLECharacteristic::PROPERTY_NOTIFY
                    );

  pCharacteristic->setCallbacks(new MyCallbacks());
  pCharacteristic->addDescriptor(new BLE2902());

  pService->start();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("BLE started. Device name: ESP32_Fingerprint_BLE");
  Serial.println("Waiting for client connection...");

  // Initialize UART1 for fingerprint sensor
  mySerial.begin(57600, SERIAL_8N1, RX_PIN, TX_PIN);
  delay(100); // Delay for stability

  finger.begin(57600);
  if (finger.verifyPassword()) {
    Serial.println("✅ Fingerprint sensor found!");
  } else {
    Serial.println("❌ Fingerprint sensor not found or password incorrect.");
    while (1) { delay(1); }
  }

  Serial.println(F("Reading sensor parameters"));
  finger.getParameters();
  Serial.print(F("Status: 0x")); Serial.println(finger.status_reg, HEX);
  Serial.print(F("Sys ID: 0x")); Serial.println(finger.system_id, HEX);
  Serial.print(F("Capacity: ")); Serial.println(finger.capacity);
  Serial.print(F("Security level: ")); Serial.println(finger.security_level);
  Serial.print(F("Device address: ")); Serial.println(finger.device_addr, HEX);
  Serial.print(F("Packet len: ")); Serial.println(finger.packet_len);
  Serial.print(F("Baud rate: ")); Serial.println(finger.baud_rate);

  finger.getTemplateCount();
  if (finger.templateCount == 0) {
    Serial.println("Sensor doesn't contain any fingerprint data.");
  } else {
    Serial.print("Sensor contains ");
    Serial.print(finger.templateCount);
    Serial.println(" templates");
  }
}

uint16_t getNextAvailableID() {
  Serial.println("Searching for next available ID...");
  sendBLEMessage("Searching for next available ID...");
  for (uint16_t id = 1; id <= finger.capacity; id++) {
    if (finger.loadModel(id) != FINGERPRINT_OK) {
      Serial.println("Found available ID: " + String(id));
      sendBLEMessage("Found available ID: " + String(id));
      return id;
    }
  }
  Serial.println("No available IDs in range 1-" + String(finger.capacity) + ".");
  sendBLEMessage("No available IDs in range 1-" + String(finger.capacity) + ".");
  return 0; // No available IDs
}

void loop() {
  // Handle BLE disconnection
  if (!deviceConnected && oldDeviceConnected) {
    delay(500); // Give the bluetooth stack the chance to get things ready
    pServer->startAdvertising(); // Restart advertising
    Serial.println("Start advertising");
    oldDeviceConnected = deviceConnected;
  }
  
  // Handle BLE connection
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }

  // Execute mode-specific actions only if device is connected
  if (deviceConnected) {
    if (mode == 1) {
      getFingerprintID();
    } else if (mode == 2 && enrolling) {
      getFingerprintEnroll();
    }
  }
  delay(100); // Increased delay to reduce load on fingerprint sensor
}

void sendTemplateIDs() {
  Serial.println("Fetching stored template IDs...");
  sendBLEMessage("Fetching stored template IDs...");
  
  // Get template count first
  uint8_t result = finger.getTemplateCount();
  if (result != FINGERPRINT_OK) {
    Serial.println("Error getting template count");
    sendBLEMessage("Error getting template count");
    return;
  }
  
  Serial.print("Total templates: "); Serial.println(finger.templateCount);
  sendBLEMessage("Total templates: " + String(finger.templateCount));

  // If no templates, send empty list
  if (finger.templateCount == 0) {
    sendBLEMessage("IDS:");
    Serial.println("No templates stored");
    sendBLEMessage("Template IDs sent");
    return;
  }

  // Check IDs more efficiently - only check reasonable range
  String idsMsg = "IDS:";
  bool first = true;
  int foundCount = 0;
  
  // Only check up to reasonable ID range or until we find all templates
  for (uint16_t id = 1; id <= 100 && foundCount < finger.templateCount; id++) {
    uint8_t loadResult = finger.loadModel(id);
    if (loadResult == FINGERPRINT_OK) {
      if (!first) {
        idsMsg += ",";
      }
      idsMsg += String(id);
      first = false;
      foundCount++;
      Serial.print("Found ID: "); Serial.println(id);
    } else if (loadResult != FINGERPRINT_BADLOCATION) {
      // Only log actual communication errors, not missing IDs
      Serial.print("Communication error checking ID "); Serial.println(id);
    }
    delay(20); // Longer delay for more reliable operation
  }
  
  sendBLEMessage(idsMsg);
  Serial.println("Template IDs sent via BLE");
  sendBLEMessage("Template IDs sent");
}

void deleteAllFingerprints() {
  Serial.println("Deleting all fingerprints...");
  sendBLEMessage("Deleting all fingerprints...");
  uint8_t p = finger.emptyDatabase();
  if (p == FINGERPRINT_OK) {
    Serial.println("All fingerprints deleted successfully");
    sendBLEMessage("All fingerprints deleted");
    finger.getTemplateCount();
    Serial.print("Total templates after deletion: "); Serial.println(finger.templateCount);
    sendBLEMessage("Total templates after deletion: " + String(finger.templateCount));
  } else {
    Serial.println("Failed to delete all fingerprints");
    sendBLEMessage("Failed to delete fingerprints");
  }
  mode = 1; // Return to Scan mode
  Serial.println("Switched to Scan mode");
  sendBLEMessage("Switched to Scan mode");
}

void deleteFingerprintByID(uint16_t id) {
  Serial.print("Attempting to delete fingerprint ID #"); Serial.println(id);
  sendBLEMessage("Deleting fingerprint ID #" + String(id));
  uint8_t p = finger.deleteModel(id);
  if (p == FINGERPRINT_OK) {
    Serial.print("Fingerprint ID #"); Serial.print(id); Serial.println(" deleted successfully");
    sendBLEMessage("Fingerprint ID #" + String(id) + " deleted");
    finger.getTemplateCount();
    Serial.print("Total templates after deletion: "); Serial.println(finger.templateCount);
    sendBLEMessage("Total templates after deletion: " + String(finger.templateCount));
  } else {
    Serial.print("Failed to delete fingerprint ID #"); Serial.print(id); Serial.println(" (Error code: " + String(p) + ")");
    sendBLEMessage("Failed to delete fingerprint ID #" + String(id));
  }
  mode = 1; // Return to Scan mode
  Serial.println("Switched to Scan mode");
  sendBLEMessage("Switched to Scan mode");
}

uint16_t getFingerprintID() {
  uint8_t p = finger.getImage();
  switch (p) {
    case FINGERPRINT_OK:
      // Serial.println("Image taken"); // Reduce serial output
      break;
    case FINGERPRINT_NOFINGER:
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Fingerprint communication error");
      return p;
    case FINGERPRINT_IMAGEFAIL:
      Serial.println("Fingerprint imaging error");
      return p;
    default:
      Serial.println("Fingerprint unknown error");
      return p;
  }

  p = finger.image2Tz();
  switch (p) {
    case FINGERPRINT_OK:
      // Serial.println("Image converted"); // Reduce serial output
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Image too messy");
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Fingerprint communication error");
      return p;
    case FINGERPRINT_FEATUREFAIL:
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      return p;
    default:
      Serial.println("Fingerprint unknown error");
      return p;
  }

  p = finger.fingerSearch();
  if (p == FINGERPRINT_OK) {
    Serial.println("Found a print match!");
    char idStr[5];
    sprintf(idStr, "%04d", finger.fingerID); // Pad ID to 4 digits
    String message = String("ThumbID: ") + UNIT_NAME + idStr;
    Serial.println(message);
    sendBLEMessage(message);
  } else if (p == FINGERPRINT_NOTFOUND) {
    // Serial.println("Did not find a match"); // Reduce serial output
    return p;
  } else {
    Serial.println("Fingerprint search error");
    return p;
  }

  Serial.print("Found ID #"); Serial.print(finger.fingerID);
  Serial.print(" with confidence of "); Serial.println(finger.confidence);

  return finger.fingerID;
}

void getFingerprintEnroll() {
  int p = -1;
  if (enroll_step == 0) {
    Serial.print("Waiting for valid finger to enroll as #"); Serial.println(enroll_id);
    sendBLEMessage("Waiting for valid finger to enroll as #" + String(enroll_id));
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image taken");
        sendBLEMessage("Image taken");
        enroll_step = 1;
        break;
      case FINGERPRINT_NOFINGER:
        return;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        sendBLEMessage("Communication error");
        return;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        sendBLEMessage("Imaging error");
        return;
      default:
        Serial.println("Unknown error");
        sendBLEMessage("Unknown error");
        return;
    }
  } else if (enroll_step == 1) {
    p = finger.image2Tz(1);
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image converted");
        sendBLEMessage("Image converted");
        break;
      case FINGERPRINT_IMAGEMESS:
        Serial.println("Image too messy");
        sendBLEMessage("Image too messy");
        enroll_step = 0;
        return;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        sendBLEMessage("Communication error");
        enroll_step = 0;
        return;
      case FINGERPRINT_FEATUREFAIL:
      case FINGERPRINT_INVALIDIMAGE:
        Serial.println("Could not find fingerprint features");
        sendBLEMessage("Could not find fingerprint features");
        enroll_step = 0;
        return;
      default:
        Serial.println("Unknown error");
        sendBLEMessage("Unknown error");
        enroll_step = 0;
        return;
    }
    Serial.println("Remove finger");
    sendBLEMessage("Remove finger");
    delay(2000);
    enroll_step = 2;
    while (finger.getImage() != FINGERPRINT_NOFINGER) {
      delay(500);
    }
    Serial.print("Place same finger again for ID #");
    Serial.println(enroll_id);
    sendBLEMessage("Place same finger again for ID #" + String(enroll_id));
  } else if (enroll_step == 2) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image taken");
        sendBLEMessage("Image taken");
        break;
      case FINGERPRINT_NOFINGER:
        return;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        sendBLEMessage("Communication error");
        return;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        sendBLEMessage("Imaging error");
        return;
      default:
        Serial.println("Unknown error");
        sendBLEMessage("Unknown error");
        return;
    }

    // Converting image to template
    p = finger.image2Tz(2);
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image converted");
        sendBLEMessage("Image converted");
        break;
      case FINGERPRINT_IMAGEMESS:
        Serial.println("Image too messy");
        sendBLEMessage("Image too messy");
        enroll_step = 0;
        return;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        sendBLEMessage("Communication error");
        enroll_step = 0;
        return;
      case FINGERPRINT_FEATUREFAIL:
      case FINGERPRINT_INVALIDIMAGE:
        Serial.println("Could not find fingerprint features");
        sendBLEMessage("Could not find fingerprint features");
        enroll_step = 0;
        return;
      default:
        Serial.println("Unknown error");
        sendBLEMessage("Unknown error");
        enroll_step = 0;
        return;
    }

    // Creating model
    Serial.print("Creating model for #");  Serial.println(enroll_id);
    sendBLEMessage("Creating model for #" + String(enroll_id));
    
    p = finger.createModel();
    if (p == FINGERPRINT_OK) {
      Serial.println("Prints matched!");
      sendBLEMessage("Prints matched!");
    } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
      Serial.println("Communication error");
      sendBLEMessage("Communication error");
      enroll_step = 0;
      return;
    } else if (p == FINGERPRINT_ENROLLMISMATCH) {
      Serial.println("Fingerprints did not match");
      sendBLEMessage("Fingerprints did not match");
      enroll_step = 0;
      return;
    } else {
      Serial.println("Unknown error");
      sendBLEMessage("Unknown error");
      enroll_step = 0;
      return;
    }

    Serial.print("ID "); Serial.println(enroll_id);
    p = finger.storeModel(enroll_id);
    if (p == FINGERPRINT_OK) {
      Serial.println("Stored!");
      char idStr[5];
      sprintf(idStr, "%04d", enroll_id); // Pad ID to 4 digits
      String registeredMsg = String("ThumbID Registered: ") + UNIT_NAME + idStr;
      Serial.println(registeredMsg);
      sendBLEMessage(registeredMsg);
      
      enrolling = false;
      enroll_step = 0;
      mode = 1; // Return to scan mode
      Serial.println("Switched to Scan mode");
      sendBLEMessage("Switched to Scan mode");
    } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
      Serial.println("Communication error");
      sendBLEMessage("Communication error");
      enroll_step = 0;
      return;
    } else if (p == FINGERPRINT_BADLOCATION) {
      Serial.println("Could not store in that location");
      sendBLEMessage("Could not store in that location");
      enroll_step = 0;
      return;
    } else if (p == FINGERPRINT_FLASHERR) {
      Serial.println("Error writing to flash");
      sendBLEMessage("Error writing to flash");
      enroll_step = 0;
      return;
    } else {
      Serial.println("Unknown error");
      sendBLEMessage("Unknown error");
      enroll_step = 0;
      return;
    }
  }
}
