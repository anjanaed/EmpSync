import React, { useState, useEffect } from "react";
import { Typography, Card, Spin, Dropdown, Menu } from "antd";
import styles from "./Page2.module.css";
import DateAndTime from "../DateAndTime/DateAndTime.jsx";
import translations from "../../../../utils/translations.jsx";
import FingerPrint from "../../../atoms/FingerPrint/FingerPrint.jsx";
import { MdLanguage } from "react-icons/md";
import { IoKeypadSharp } from "react-icons/io5";
import { BiFingerprint } from "react-icons/bi";
import { MdSync } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import FingerprintBLE from "../../../../utils/fingerprintBLE.js";
import { useMealData } from "../../../../contexts/MealDataContext.jsx";
import { useAuth } from "../../../../contexts/AuthContext.jsx";

const Page2 = ({
  carouselRef,
  language,
  setLanguage,
  setUsername,
  setUserId,
  resetPin,
  setResetPin,
}) => {
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_BASE_URL;
  const { authData } = useAuth(); // Add auth context
  const { preloadMealData, clearData } = useMealData(); // Add meal data context
  const [errorMessage, setErrorMessage] = useState("");
  const [pin, setPin] = useState("");
  const text = translations[language];
  const [scanning, setScanning] = useState(false);
  const [showFingerprint, setShowFingerprint] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [fingerprintConnected, setFingerprintConnected] = useState(false);
  const [fingerprintUnitName, setFingerprintUnitName] = useState("");
  const [fingerprintBLE, setFingerprintBLE] = useState(null);
  const [showFingerprintPopup, setShowFingerprintPopup] = useState(false);
  const [verifiedMessage, setVerifiedMessage] = useState("");

  // Check for existing fingerprint connection on component mount
  useEffect(() => {
    // Initialize BLE instance
    const bleInstance = new FingerprintBLE();
    setFingerprintBLE(bleInstance);

    // Check for existing connection
    if (window.fingerprintBLEInstance && window.fingerprintBLEInstance.getConnectionStatus()) {
      console.log("Restoring existing BLE fingerprint connection");
      setFingerprintBLE(window.fingerprintBLEInstance);
      setFingerprintConnected(true);
      
      // Try to get the unit name from global storage
      if (window.fingerprintUnitName) {
        setFingerprintUnitName(window.fingerprintUnitName);
      } else {
        // Query the unit name if not stored
        setTimeout(async () => {
          try {
            await window.fingerprintBLEInstance.sendCommand("UNIT_NAME");
          } catch (e) {
            console.error("Error querying unit name on restore:", e);
          }
        }, 500);
      }
    }
    
    // Set up BLE data handler
    if (window.fingerprintBLEInstance) {
      window.fingerprintBLEInstance.onData((data) => {
        handleBLEData(data);
      });
      
      window.fingerprintBLEInstance.onConnectionChange((connected) => {
        setFingerprintConnected(connected);
        if (!connected) {
          setFingerprintUnitName("");
          window.fingerprintUnitName = "";
        }
      });
    }
    
    // Listen for connection changes from other components
    const handleConnectionChange = (event) => {
      console.log("Page2 received BLE connection change event:", event.detail);
      if (event.detail.connected) {
        setFingerprintConnected(true);
        if (window.fingerprintUnitName) {
          setFingerprintUnitName(window.fingerprintUnitName);
        }
      } else {
        setFingerprintConnected(false);
        setFingerprintUnitName("");
      }
    };
    
    window.addEventListener('fingerprintBLEConnectionChanged', handleConnectionChange);
    
    // Listen for registration completion
    const handleRegistrationComplete = () => {
      console.log("Registration complete, BLE communication continues");
    };
    
    window.addEventListener('fingerprintRegistrationComplete', handleRegistrationComplete);
    
    return () => {
      window.removeEventListener('fingerprintBLEConnectionChanged', handleConnectionChange);
      window.removeEventListener('fingerprintRegistrationComplete', handleRegistrationComplete);
    };
  }, []);

  // Sync selectedLanguage with language prop
  useEffect(() => {
    const langMap = {
      english: "English",
      sinhala: "සිංහල",
      tamil: "தமிழ்",
    };
    setSelectedLanguage(langMap[language] || "English");
  }, [language]);

  // Cleanup BLE connection on component unmount (but keep connection alive)
  useEffect(() => {
    return () => {
      // Don't disconnect BLE - keep it alive for other pages
      // The connection will be managed globally
    };
  }, [fingerprintBLE]);

  // Handle BLE data from ESP32
  const handleBLEData = async (data) => {
    const lines = data.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('ThumbID: ')) {
        console.log('BLE ThumbID:', line);
        const match = line.match(/ThumbID: (FPU\d{3}\d{4})/);
        if (match) {
          const fullThumbId = match[1];
          console.log(`Fingerprint scanned - ThumbID: ${fullThumbId}`);
          await fetchUserByFingerprintId(fullThumbId);
        }
      } else if (line.startsWith('UnitName: ')) {
        const unitName = line.substring(10).trim();
        setFingerprintUnitName(unitName);
        window.fingerprintUnitName = unitName; // Store globally for persistence
        console.log(`Unit Name received: ${unitName}`);
      } else if (line.includes('Fingerprint ID #') && line.includes('deleted')) {
        console.log(`✅ R307 Delete Success: ${line}`);
      } else if (line.includes('Failed to delete fingerprint ID #')) {
        console.log(`❌ R307 Delete Error: ${line}`);
      } else if (line.includes('All fingerprints deleted')) {
        console.log(`✅ R307 Bulk Delete Success: ${line}`);
      } else if (line.includes('Failed to delete fingerprints')) {
        console.log(`❌ R307 Bulk Delete Error: ${line}`);
      } else if (line.startsWith('IDS:')) {
        // Handle stored fingerprint IDs for cleanup
        await handleStoredFingerprints(line);
      }
    }
  };

  // Handle PIN digit input
  const handlePinInput = (digit) => {
    if (pin.length < 6) {
      setPin(pin + digit);
    }
  };

  // Handle stored fingerprints for cleanup
  const handleStoredFingerprints = async (idsLine) => {
    // Use local state first, then fallback to global storage
    const unitName = fingerprintUnitName || window.fingerprintUnitName;
    
    if (!unitName) {
      console.warn('Unit name not available for fingerprint cleanup');
      console.log('fingerprintUnitName state:', fingerprintUnitName);
      console.log('window.fingerprintUnitName:', window.fingerprintUnitName);
      setErrorMessage("Unit name not available. Please reconnect the fingerprint unit.");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }
    
    const idsMatch = idsLine.match(/IDS:([\d,]*)/);
    if (idsMatch) {
      const idsStr = idsMatch[1];
      if (idsStr.length === 0) {
        console.log('No fingerprints stored in R307');
        setErrorMessage("No fingerprints found in R307 storage");
        setTimeout(() => setErrorMessage(""), 2000);
        return;
      }
      
      const ids = idsStr.split(',').map(id => id.trim()).filter(id => id.length > 0);
      
      // Convert IDs to standard thumbID format using unit name
      // Example: Unit FPU004, ID 1 -> FPU0040001
      const thumbIds = ids.map(id => `${unitName}${id.padStart(4, '0')}`);
      console.log(`Found ${ids.length} fingerprints in R307 storage:`);
      console.log('Unit Name Used:', unitName);
      console.log('Original IDs:', ids.join(', '));
      console.log('Standard Thumb IDs:', thumbIds.join(', '));

      // Check which thumbIds are not in the database
      try {
        setErrorMessage("Checking database for registered fingerprints...");
        const headers = {};
        if (authData?.accessToken) {
          headers.Authorization = `Bearer ${authData.accessToken}`;
        }

        const response = await fetch(`${baseURL}/user-finger-print-register-backend/all-fingerprints`, {
          headers
        });
        if (response.ok) {
          const dbFingerprints = await response.json();
          const dbThumbIds = dbFingerprints.map(fp => fp.thumbid);
          
          // Find IDs that are in R307 but not in database
          const notInDb = thumbIds.filter(id => !dbThumbIds.includes(id));
          
          if (notInDb.length > 0) {
            console.log('🔍 Analysis Results:');
            console.log(`✅ Registered in database: ${thumbIds.length - notInDb.length} fingerprints`);
            console.log(`❌ Not in database: ${notInDb.length} fingerprints`);
            console.log('Unregistered Thumb IDs:', notInDb.join(', '));
            
            setErrorMessage(`Found ${notInDb.length} unregistered fingerprints. Cleaning up...`);
            
            // Convert thumb IDs back to original IDs and delete them from R307 storage
            console.log('🧹 Starting cleanup of unregistered fingerprints...');
            await deleteUnregisteredFingerprintsFromR307(notInDb, unitName);
            
            setTimeout(() => {
              setErrorMessage(`Successfully cleaned up ${notInDb.length} unregistered fingerprints`);
              setTimeout(() => setErrorMessage(""), 3000);
            }, 1000);
          } else {
            console.log('✅ All fingerprints in R307 storage are properly registered in database');
            setErrorMessage("All fingerprints are properly registered. No cleanup needed.");
            setTimeout(() => setErrorMessage(""), 3000);
          }
        } else {
          console.warn('Could not fetch fingerprints from database');
          setErrorMessage("Error: Could not access fingerprint database");
          setTimeout(() => setErrorMessage(""), 2000);
        }
      } catch (err) {
        console.error('Error checking thumbids in database:', err);
        setErrorMessage("Error checking fingerprint database: " + err.message);
        setTimeout(() => setErrorMessage(""), 2000);
      }
    }
  };

  // Clear PIN on mount and when resetPin is true
  useEffect(() => {
    setPin("");
    setErrorMessage("");
    setVerifiedMessage("");
  }, []);

  useEffect(() => {
    if (resetPin) {
      setPin("");
      setErrorMessage("");
      setVerifiedMessage("");
      setResetPin(false);
      // Clear meal data when resetting/logging out
      clearData();
    }
  }, [resetPin, setResetPin, clearData]);

  // Handle backspace for PIN
  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  // Convert thumb IDs to original IDs and delete from R307 storage
  // Example conversion: FPU0040003 -> 3, FPU0040004 -> 4, FPU0040005 -> 5
  const deleteUnregisteredFingerprintsFromR307 = async (thumbIds, unitName) => {
    // Use global BLE instance for more reliable connection checking
    const bleInstance = fingerprintBLE || window.fingerprintBLEInstance;
    const isConnected = fingerprintConnected || (window.fingerprintBLEInstance && window.fingerprintBLEInstance.getConnectionStatus());
    
    if (!isConnected || !bleInstance) {
      console.error('Fingerprint unit not connected');
      console.log('fingerprintConnected state:', fingerprintConnected);
      console.log('fingerprintBLE instance:', !!fingerprintBLE);
      console.log('window.fingerprintBLEInstance:', !!window.fingerprintBLEInstance);
      console.log('global connection status:', window.fingerprintBLEInstance?.getConnectionStatus());
      setErrorMessage("Fingerprint unit not connected");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }

    if (!unitName) {
      console.error('Unit name not available for conversion');
      setErrorMessage("Unit name not available for cleanup");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }

    try {
      console.log(`🗑️ Starting deletion of ${thumbIds.length} unregistered fingerprints from R307 storage`);
      console.log(`📋 Unit: ${unitName}`);
      console.log(`📋 Unregistered Thumb IDs to clean: ${thumbIds.join(', ')}`);

      let deletedCount = 0;
      for (const thumbId of thumbIds) {
        // Convert thumb ID back to original ID
        // Remove unit name prefix and leading zeros
        // Example: FPU0040003 -> remove FPU004 -> 0003 -> 3
        let originalId = thumbId.replace(unitName, '');
        originalId = originalId.replace(/^0+/, '') || '0'; // Remove leading zeros, but keep at least one digit
        
        // Validate the original ID is a number
        const idNumber = parseInt(originalId, 10);
        if (isNaN(idNumber) || idNumber < 1 || idNumber > 1000) {
          console.warn(`⚠️ Invalid original ID extracted from ${thumbId}: ${originalId}, skipping deletion`);
          continue;
        }
        
        console.log(`🔄 Converting ${thumbId} → Original ID: ${originalId}`);
        
        // Send delete command to ESP32 via BLE
        const deleteCommand = `DELETE_ID:${originalId}`;
        await bleInstance.sendCommand(deleteCommand);
        console.log(`📤 Sent BLE delete command: ${deleteCommand}`);
        deletedCount++;
        
        // Small delay between commands to avoid overwhelming the module
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`✅ Successfully sent delete commands for ${deletedCount}/${thumbIds.length} unregistered fingerprints`);
      
      if (deletedCount === thumbIds.length) {
        console.log(`🎉 All ${deletedCount} unregistered fingerprints have been cleaned from R307 storage`);
      } else {
        console.log(`⚠️ ${deletedCount} out of ${thumbIds.length} fingerprints were processed`);
      }
      
    } catch (error) {
      console.error('❌ Error deleting fingerprints from R307 storage:', error);
      setErrorMessage("Error during cleanup: " + error.message);
      setTimeout(() => setErrorMessage(""), 2000);
    }
  };

  // Handle fingerprint scanning
  const handleFingerprint = async () => {
    if (!fingerprintConnected || !fingerprintBLE) {
      setErrorMessage("Fingerprint unit not connected");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }
    
    setScanning(true);
    try {
      // The scanning is handled automatically by the BLE data handler
      // Just trigger a scan command to ensure the device is in scan mode
      await fingerprintBLE.sendCommand("SCAN");
      console.log("Scan command sent via BLE");
      
      // Reset scanning state after a short delay
      setTimeout(() => {
        setScanning(false);
      }, 2000);
      
    } catch (error) {
      console.error("Fingerprint scan error:", error);
      setErrorMessage("Fingerprint scan error");
      setTimeout(() => setErrorMessage(""), 2000);
      setScanning(false);
    }
  };

  // Fetch employee ID by thumbid (fingerprint ID) and set username for Page3
  const fetchUserByFingerprintId = async (fingerId) => {
    try {
      const headers = {};
      if (authData?.accessToken) {
        headers.Authorization = `Bearer ${authData.accessToken}`;
      }

      const response = await fetch(`${baseURL}/user-finger-print-register-backend/fingerprint?thumbid=${fingerId}`, {
        headers
      });
      if (!response.ok) {
        throw new Error("Fingerprint not found");
      }
      const fingerprint = await response.json();
      const empId = fingerprint.empId;
      if (!empId) {
        throw new Error("No employee ID found for this fingerprint");
      }
      const userResponse = await fetch(`${baseURL}/user/${empId}`, {
        headers
      });
      if (!userResponse.ok) {
        throw new Error("User not found for this employee ID");
      }
      const user = await userResponse.json();
      setUsername({ name: user.name, gender: user.gender, organizationId: user.organizationId });
      setUserId(user.id);
      console.log("Retrieved Username:", user.name);
      console.log("Retrieved User ID:", user.id);
      console.log("Retrieved Organization ID:", user.organizationId);
      
      // Show verified message
      setVerifiedMessage("Verified");
      setTimeout(() => setVerifiedMessage(""), 1500);
      
      // Preload meal data before navigation
      if (user.organizationId) {
        console.log("Preloading meal data for organization:", user.organizationId);
        try {
          await preloadMealData(user.organizationId, new Date());
          console.log("Meal data preloaded successfully");
        } catch (preloadError) {
          console.error("Error preloading meal data:", preloadError);
          // Continue with navigation even if preloading fails
        }
      }
      
      setTimeout(() => {
        carouselRef.current.goTo(2);
      }, 100);
    } catch (error) {
      console.error("Error fetching employee by fingerprint:", error);
      setErrorMessage(text.invalidFingerprint);
      setTimeout(() => setErrorMessage(""), 2000);
      setScanning(false);
    }
  };

  // Handle PIN submission
  const handlePinSubmit = async () => {
    if (pin.length === 6) {
      setScanning(true);
      try {
        const headers = {};
        if (authData?.accessToken) {
          headers.Authorization = `Bearer ${authData.accessToken}`;
        }

        const response = await fetch(`${baseURL}/user/passkey/${pin}`, {
          headers
        });
        if (!response.ok) {
          throw new Error("User not found");
        }
        const user = await response.json();
        setUsername({ name: user.name, gender: user.gender, organizationId: user.organizationId });
        setUserId(user.id);
        console.log("Retrieved Username:", user.name);
        console.log("Retrieved User ID:", user.id);
        console.log("Retrieved Organization ID:", user.organizationId);
        
        // Show verified message
        setVerifiedMessage("Verified");
        setTimeout(() => setVerifiedMessage(""), 1500);
        
        // Preload meal data before navigation
        if (user.organizationId) {
          console.log("Preloading meal data for organization:", user.organizationId);
          try {
            await preloadMealData(user.organizationId, new Date());
            console.log("Meal data preloaded successfully");
          } catch (preloadError) {
            console.error("Error preloading meal data:", preloadError);
            // Continue with navigation even if preloading fails
          }
        }
        
        setTimeout(() => {
          carouselRef.current.goTo(2);
        }, 100);
      } catch (error) {
        console.error("Error fetching user:", error);
        setErrorMessage(text.invalidPin);
        setTimeout(() => setErrorMessage(""), 2000);
      } finally {
        setScanning(false);
      }
    }
  };

  useEffect(() => {
    if (pin.length === 6) {
      handlePinSubmit();
    }
  }, [pin]);

  // Language menu
  const languageMenu = (
    <Menu
      onClick={(e) => {
        setSelectedLanguage(e.key);
        setLanguage(e.key.toLowerCase());
      }}
      style={{
        background: "linear-gradient(135deg, #720000, #e30000)",
        color: "white",
        borderRadius: "8px",
      }}
    >
      <Menu.Item style={{ fontSize: "16px", padding: "10px 20px", color: "white" }}>
        English
      </Menu.Item>
      <Menu.Item style={{ fontSize: "16px", padding: "10px 20px", color: "white" }}>
        සිංහල
      </Menu.Item>
      <Menu.Item style={{ fontSize: "16px", padding: "10px 20px", color: "white" }}>
        தமிழ்
      </Menu.Item>
    </Menu>
  );

  // Handle opening fingerprint popup
  const handleOpenFingerprintPopup = () => {
    setShowFingerprintPopup(true);
  };

  // Handle closing fingerprint popup
  const handleCloseFingerprintPopup = () => {
    setShowFingerprintPopup(false);
  };

  // Handle ESC key to close popup
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showFingerprintPopup) {
        handleCloseFingerprintPopup();
      }
    };

    if (showFingerprintPopup) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFingerprintPopup]);

  // Handle manual cleanup of unregistered fingerprints
  const handleCleanupUnregisteredFingerprints = async () => {
    // Use global BLE instance for more reliable connection checking
    const bleInstance = fingerprintBLE || window.fingerprintBLEInstance;
    const isConnected = fingerprintConnected || (window.fingerprintBLEInstance && window.fingerprintBLEInstance.getConnectionStatus());
    
    if (!isConnected || !bleInstance) {
      setErrorMessage("Fingerprint unit not connected");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }

    // Use local state first, then fallback to global storage
    const unitName = fingerprintUnitName || window.fingerprintUnitName;
    
    if (!unitName) {
      setErrorMessage("Unit name not available. Please reconnect the fingerprint unit.");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }

    // Ensure unit name is stored globally for consistency
    if (fingerprintUnitName && !window.fingerprintUnitName) {
      window.fingerprintUnitName = fingerprintUnitName;
    }

    try {
      console.log("🧹 Manual cleanup initiated");
      console.log(`📋 Unit: ${unitName}`);
      console.log('📋 Local state unit name:', fingerprintUnitName);
      console.log('📋 Global unit name:', window.fingerprintUnitName);
      
      // First, get the current IDs from the R307 module via BLE
      await bleInstance.sendCommand("GET_IDS");
      
      console.log("📤 Requesting IDs from R307 module for cleanup...");
      setErrorMessage("Scanning R307 storage for unregistered fingerprints...");
      
      // The actual cleanup will happen in handleStoredFingerprints when the IDS: response is received
      
    } catch (error) {
      console.error("❌ Error initiating cleanup:", error);
      setErrorMessage("Error initiating cleanup: " + error.message);
      setTimeout(() => setErrorMessage(""), 2000);
    }
  };

  // Handle Connect Fingerprint button
  const handleConnectFingerprint = async () => {
    if (!fingerprintBLE) {
      setErrorMessage("BLE not initialized");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }

    if (!fingerprintBLE.isSupported()) {
      setErrorMessage("Web Bluetooth API not supported in this browser.");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }

    try {
      setLoading(true);
      
      // Connect to BLE device
      await fingerprintBLE.connect();
      
      // Store globally for other components
      window.fingerprintBLEInstance = fingerprintBLE;
      setFingerprintConnected(true);
      
      // Set up data handler for this instance
      fingerprintBLE.onData((data) => {
        handleBLEData(data);
      });
      
      fingerprintBLE.onConnectionChange((connected) => {
        setFingerprintConnected(connected);
        if (!connected) {
          setFingerprintUnitName("");
          window.fingerprintUnitName = "";
        }
        
        // Broadcast connection status to other components
        window.dispatchEvent(new CustomEvent('fingerprintBLEConnectionChanged', { 
          detail: { connected: connected, device: fingerprintBLE.getDeviceInfo() } 
        }));
      });

      // Test BLE connection and request initial data
      setTimeout(async () => {
        try {
          // Test the connection first
          const connectionWorking = await fingerprintBLE.testConnection();
          
          if (connectionWorking) {
            console.log('BLE connection is working properly');
            
            // Request template IDs after connection is stable
            setTimeout(async () => {
              try {
                await fingerprintBLE.sendCommand("GET_IDS");
                console.log('Requested template IDs from ESP32');
              } catch (e) {
                console.log("Failed to request template IDs:", e.message);
              }
            }, 500);
            
            // Optionally request unit name if not received
            if (!window.fingerprintUnitName) {
              setTimeout(async () => {
                try {
                  await fingerprintBLE.sendCommand("UNIT_NAME");
                } catch (e) {
                  console.log("UNIT_NAME command failed, but ESP32 sends it automatically anyway:", e.message);
                }
              }, 1000);
            }
          } else {
            console.log('BLE connection test failed, but scanning should still work');
          }
        } catch (e) {
          console.error("Error testing BLE connection:", e);
          // Don't show error to user since scanning might still work
        }
      }, 1500); // Give ESP32 time to be ready

      setLoading(false);
      
    } catch (error) {
      setLoading(false);
      setErrorMessage("BLE Connection failed: " + error.message);
      setTimeout(() => setErrorMessage(""), 2000);
    }
  };

  return (
    <Spin spinning={loading} tip="Loading...">
      <div className={styles.full}>
        <div>
          <Typography.Title level={1} className={styles.mainTitle1}>
            Welcome to <span>Helix</span> Food Ordering
          </Typography.Title>
        </div>
        <div className={styles.dateAndTime}>
          <DateAndTime />
        </div>
        <div className={styles.full}>
          <Card className={styles.card} bodyStyle={{ padding: 3 }}>
            <div className={styles.content}>
              {showFingerprint ? (
                <div className={styles.fingerprintSection}>
                  <div className={styles.fingerprintScanner} onClick={() => {
                    if (!fingerprintConnected || !fingerprintBLE) {
                      setErrorMessage("Fingerprint unit not connected");
                      setTimeout(() => setErrorMessage(""), 2000);
                      return;
                    }
                    handleFingerprint();
                  }}>
                    <FingerPrint />
                  </div>
                  <p>
                    {scanning ? (
                      <span className={styles.SectionTexts}>Scanning...</span>
                    ) : (
                      <span className={styles.SectionTexts}>{text.fingerprint}</span>
                    )}
                  </p>
                </div>
              ) : (
                <div className={styles.pinSection}>
                  <div className={styles.SectionTexts}>{text.enterPin}</div>
                  <div className={styles.pinDots}>
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <span
                        key={idx}
                        className={`${styles.pinDot} ${pin.length > idx ? styles.filled : ""}`}
                      />
                    ))}
                  </div>
                  <div className={styles.pinButtons}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, "#", 0].map((digit) => (
                        <button
                            key={digit}
                            type="button"
                            className={styles.keypadButton}
                            onClick={() => handlePinInput(digit.toString())}
                            disabled={pin.length >= 6}
                        >
                            {digit}
                        </button>
                    ))}
                    <button
                        type="button"
                        className={styles.keypadButton}
                        onClick={handleBackspace}
                    >
                        ⮌
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
        <div className={styles.buttonRowContainer}>
          <div className={styles.leftButtonCorner}>
            {!fingerprintConnected ? (
              <button
                className={styles.connectFingerprintButton}
                onClick={handleOpenFingerprintPopup}
              >
                Connect FingerPrint
              </button>
            ) : (
              <div style={{ fontWeight: "bold", color: "#4CAF50", marginTop: 8 }}>
                {/* UNIT NAME: {fingerprintUnitName} */}
              </div>
            )}
            <button
              className={styles.registerButton}
              onClick={() => navigate("/user-fingerprint-register")}
              disabled={!fingerprintConnected}
              style={{
                opacity: fingerprintConnected ? 1 : 0.5,
                cursor: fingerprintConnected ? "pointer" : "not-allowed",
                backgroundColor: fingerprintConnected ? undefined : "#cccccc"
              }}
              title={!fingerprintConnected ? "Connect to a fingerprint unit first" : "Register a new user"}
            >
              New User Register
            </button>
          </div>
          <div>
            <span style={{ fontSize: "70px", fontWeight: "bold"}}>
              {fingerprintUnitName}

            </span>
          </div>
          <div className={styles.backButtonContainer}>
            <button
              className={styles.toggleButton}
              onClick={() => setShowFingerprint((prev) => !prev)}
            >
              {showFingerprint ? <IoKeypadSharp size={30} /> : <BiFingerprint size={30} />}
            </button>
            <button
              onClick={() => {
                console.log(`Page2.jsx: Back button clicked, ${selectedLanguage} selected`);
                carouselRef.current.goTo(0);
              }}
              className={styles.backButton}
            >
              <MdLanguage size={20} /> <div>{selectedLanguage}</div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Fingerprint Connection Popup */}
      {showFingerprintPopup && (
        <div 
          className={styles.popupOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseFingerprintPopup();
            }
          }}
        >
          <div className={styles.popupContent}>
            <h3 style={{ marginBottom: "20px", textAlign: "center", color: "#333" }}>Fingerprint Options</h3>
            <div className={styles.popupButtons}>
              <button
                className={styles.popupButton}
                onClick={async () => {
                  if (!fingerprintConnected) {
                    await handleConnectFingerprint();
                  }
                }}
                style={{ backgroundColor: fingerprintConnected ? "#4CAF50" : "#4CAF50", color: "white", opacity: fingerprintConnected ? 0.6 : 1, cursor: fingerprintConnected ? "not-allowed" : "pointer" }}
                disabled={fingerprintConnected}
              >
                {fingerprintConnected ? "Device Connected" : "Connect FingerPrint Unit"}
              </button>
              <button
                className={styles.popupButton}
                onClick={async () => {
                  handleCloseFingerprintPopup();
                  await handleCleanupUnregisteredFingerprints();
                }}
                disabled={!fingerprintConnected}
                style={{ 
                  backgroundColor: fingerprintConnected ? "#2196F3" : "#cccccc",
                  color: fingerprintConnected ? "white" : "#666666",
                  cursor: fingerprintConnected ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                title={!fingerprintConnected ? "Connect to a fingerprint unit first" : "Sync system and clean up unregistered fingerprints from R307 storage"}
              >
                <MdSync size={18} />
                Sync System
              </button>
            </div>
            <button
              className={styles.popupCloseButton}
              onClick={handleCloseFingerprintPopup}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {errorMessage && <div className={styles.errorPopup}>{errorMessage}</div>}
      {verifiedMessage && (
        <>
          <div className={styles.verifiedBackdrop}></div>
          <div className={styles.verifiedPopup}>
            <div className={styles.verifiedIcon}>✓</div>
            <div>{verifiedMessage}</div>
          </div>
        </>
      )}
    </Spin>
  );
};

export default Page2;