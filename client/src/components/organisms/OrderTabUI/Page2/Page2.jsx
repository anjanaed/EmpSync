import React, { useState, useEffect } from "react";
import { Typography, Card, Spin, Dropdown, Menu } from "antd";
import styles from "./Page2.module.css";
import DateAndTime from "../DateAndTime/DateAndTime";
import translations from "../../../../utils/translations";
import FingerPrint from "../../../atoms/FingerPrint/FingerPrint";
import { MdLanguage } from "react-icons/md";
import { IoKeypadSharp } from "react-icons/io5";
import { BiFingerprint } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [pin, setPin] = useState("");
  const text = translations[language];
  const [scanning, setScanning] = useState(false);
  const [showFingerprint, setShowFingerprint] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [fingerprintConnected, setFingerprintConnected] = useState(false);
  const [fingerprintUnitName, setFingerprintUnitName] = useState("");
  const [serialReader, setSerialReader] = useState(null);
  const [serialReadingActive, setSerialReadingActive] = useState(false);
  const [showFingerprintPopup, setShowFingerprintPopup] = useState(false);

  // Sync selectedLanguage with language prop
  useEffect(() => {
    const langMap = {
      english: "English",
      sinhala: "සිංහල",
      tamil: "தமிழ்",
    };
    setSelectedLanguage(langMap[language] || "English");
  }, [language]);

  // Cleanup serial reader on component unmount
  useEffect(() => {
    return () => {
      setSerialReadingActive(false);
      if (serialReader) {
        serialReader.cancel().catch(() => {});
        serialReader.releaseLock();
      }
      if (window.fingerprintSerialPort) {
        window.fingerprintSerialPort.close().catch(() => {});
      }
    };
  }, [serialReader]);

  // Continuous serial reading effect
  useEffect(() => {
    if (fingerprintConnected && window.fingerprintSerialPort && !serialReadingActive) {
      let cancelled = false;
      setSerialReadingActive(true);
      const readSerial = async () => {
        let buffer = '';
        try {
          const reader = window.fingerprintSerialPort.readable.getReader();
          setSerialReader(reader);
          while (!cancelled) {
            const { value, done } = await reader.read();
            if (done || cancelled) break;
            buffer += new TextDecoder().decode(value);
            let lines = buffer.split('\n');
            buffer = lines.pop();
            for (let line of lines) {
              line = line.trim();
              if (line.startsWith('ThumbID: ')) {
                console.log('Serial ThumbID:', line);
                const match = line.match(/ThumbID: (FPU\d{3}\d{4})/);
                if (match) {
                  const fullThumbId = match[1];
                  console.log(`Fingerprint scanned - ThumbID: ${fullThumbId}`);
                  await fetchUserByFingerprintId(fullThumbId);
                }
              } else if (line.startsWith('UnitName: ')) {
                const unitName = line.substring(10).trim();
                setFingerprintUnitName(unitName);
                console.log(`Unit Name received: ${unitName}`);
              } else if (line.includes('Fingerprint ID #') && line.includes('deleted')) {
                console.log(`✅ R307 Delete Success: ${line}`);
              } else if (line.includes('Failed to delete fingerprint ID #')) {
                console.log(`❌ R307 Delete Error: ${line}`);
              } else if (line.includes('All fingerprints deleted')) {
                console.log(`✅ R307 Bulk Delete Success: ${line}`);
              } else if (line.includes('Failed to delete fingerprints')) {
                console.log(`❌ R307 Bulk Delete Error: ${line}`);
              }
            }
          }
          reader.releaseLock();
          setSerialReader(null);
        }

        catch (err) {
          console.error('Serial read error:', err);
        }
        setSerialReadingActive(false);
      };
      readSerial();
      return () => {
        cancelled = true;
      };
    }
  }, [fingerprintConnected, serialReadingActive]);

  // Handle PIN digit input
  const handlePinInput = (digit) => {
    if (pin.length < 6) {
      setPin(pin + digit);
    }
  };

  // Clear PIN on mount and when resetPin is true
  useEffect(() => {
    setPin("");
    setErrorMessage("");
  }, []);

  useEffect(() => {
    if (resetPin) {
      setPin("");
      setErrorMessage("");
      setResetPin(false);
    }
  }, [resetPin, setResetPin]);

  // Handle backspace for PIN
  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  // Convert thumb IDs to original IDs and delete from R307 storage
  // Example conversion: FPU0010003 -> 3, FPU0010004 -> 4, FPU0010005 -> 5, FPU0010006 -> 6
  const deleteUnregisteredFingerprintsFromR307 = async (thumbIds, unitName) => {
    if (!window.fingerprintSerialPort || !fingerprintConnected) {
      console.error('Fingerprint unit not connected');
      return;
    }

    if (!unitName) {
      console.error('Unit name not available for conversion');
      return;
    }

    try {
      const writer = window.fingerprintSerialPort.writable.getWriter();
      const encoder = new TextEncoder();

      console.log(`Starting deletion of ${thumbIds.length} unregistered fingerprints from R307 storage`);

      for (const thumbId of thumbIds) {
        // Convert thumb ID back to original ID
        // Remove unit name prefix and leading zeros
        // Example: FPU0010003 -> remove FPU001 -> 0003 -> 3
        let originalId = thumbId.replace(unitName, '');
        originalId = originalId.replace(/^0+/, '') || '0'; // Remove leading zeros, but keep at least one digit
        
        // Validate the original ID is a number
        const idNumber = parseInt(originalId, 10);
        if (isNaN(idNumber) || idNumber < 1 || idNumber > 1000) {
          console.warn(`Invalid original ID extracted from ${thumbId}: ${originalId}, skipping deletion`);
          continue;
        }
        
        console.log(`Converting ${thumbId} to original ID: ${originalId}`);
        
        // Send delete command to R307 module
        const deleteCommand = `DELETE_ID:${originalId}\n`;
        await writer.write(encoder.encode(deleteCommand));
        console.log(`Sent delete command: DELETE_ID:${originalId}`);
        
        // Small delay between commands to avoid overwhelming the module
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      writer.releaseLock();
      console.log(`Successfully sent delete commands for ${thumbIds.length} unregistered fingerprints`);
      
    } catch (error) {
      console.error('Error deleting fingerprints from R307 storage:', error);
    }
  };

  // Handle fingerprint scanning
  const handleFingerprint = async () => {
    if (!fingerprintConnected) {
      setErrorMessage(text.fingerprintNotConnected);
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }
    setScanning(true);
    try {
      const reader = window.fingerprintSerialPort.readable.getReader();
      setSerialReader(reader);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        console.log("Serial data received:\n", text);

        // Parse IDS and print as standard thumb ids if present
        const idsMatch = text.match(/IDS:([\d,]+)/);
        if (idsMatch && fingerprintUnitName) {
          const ids = idsMatch[1].split(',').map(id => id.trim());
          const thumbIds = ids.map(id => `${fingerprintUnitName}${id.padStart(4, '0')}`);
          console.log('Standard Thumb IDs:', thumbIds.join(', '));

          // Check which thumbIds are not in the database
          try {
            const response = await fetch(`${baseURL}/user-finger-print-register-backend/all-fingerprints`);
            if (response.ok) {
              const dbFingerprints = await response.json();
              const dbThumbIds = dbFingerprints.map(fp => fp.thumbid);
              const notInDb = thumbIds.filter(id => !dbThumbIds.includes(id));
              if (notInDb.length > 0) {
                console.log('These IDs are not in database:', notInDb.join(', '));
                console.log(`Found ${notInDb.length} unregistered fingerprints in R307 storage`);
                
                // Automatically convert thumb IDs back to original IDs and delete them from R307 storage
                console.log('Starting automatic cleanup of unregistered fingerprints...');
                await deleteUnregisteredFingerprintsFromR307(notInDb, fingerprintUnitName);
              } else {
                console.log('All fingerprints in R307 storage are properly registered in database');
              }
            } else {
              console.warn('Could not fetch fingerprints from database');
            }
          } catch (err) {
            console.error('Error checking thumbids in database:', err);
          }
        }

        const match = text.match(/ThumbID: (FPU\d{3}\d{4})/);
        if (match) {
          const fullThumbId = match[1];
          console.log(`Fingerprint scanned - ThumbID: ${fullThumbId}`);
          await fetchUserByFingerprintId(fullThumbId);
          // Do not break or release the reader; keep communication alive
        }
      }
      // Do not release the reader or setSerialReader(null) here; keep communication alive
    } catch (error) {
      console.error("Fingerprint scan error:", error);
      setErrorMessage(text.fingerprintError);
      setTimeout(() => setErrorMessage(""), 2000);
      setScanning(false);
    }
  };

  // Fetch employee ID by thumbid (fingerprint ID) and set username for Page3
  const fetchUserByFingerprintId = async (fingerId) => {
    try {
      const response = await fetch(`${baseURL}/user-finger-print-register-backend/fingerprint?thumbid=${fingerId}`);
      if (!response.ok) {
        throw new Error("Fingerprint not found");
      }
      const fingerprint = await response.json();
      const empId = fingerprint.empId;
      if (!empId) {
        throw new Error("No employee ID found for this fingerprint");
      }
      const userResponse = await fetch(`${baseURL}/user/${empId}`);
      if (!userResponse.ok) {
        throw new Error("User not found for this employee ID");
      }
      const user = await userResponse.json();
      setUsername({ name: user.name, gender: user.gender, organizationId: user.organizationId });
      setUserId(user.id);
      console.log("Retrieved Username:", user.name);
      console.log("Retrieved User ID:", user.id);
      console.log("Retrieved Organization ID:", user.organizationId);
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
        const response = await fetch(`${baseURL}/user/passkey/${pin}`);
        if (!response.ok) {
          throw new Error("User not found");
        }
        const user = await response.json();
        setUsername({ name: user.name, gender: user.gender, organizationId: user.organizationId });
        setUserId(user.id);
        console.log("Retrieved Username:", user.name);
        console.log("Retrieved User ID:", user.id);
        console.log("Retrieved Organization ID:", user.organizationId);
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
    if (!fingerprintConnected || !window.fingerprintSerialPort) {
      setErrorMessage("Fingerprint unit not connected");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }

    try {
      // First, get the current IDs from the R307 module
      const writer = window.fingerprintSerialPort.writable.getWriter();
      await writer.write(new TextEncoder().encode("GET_IDS\n"));
      writer.releaseLock();
      
      console.log("Requesting IDs from R307 module for cleanup...");
      setErrorMessage("Scanning R307 storage for cleanup...");
      setTimeout(() => setErrorMessage(""), 3000);
      
    } catch (error) {
      console.error("Error initiating cleanup:", error);
      setErrorMessage("Error initiating cleanup: " + error.message);
      setTimeout(() => setErrorMessage(""), 2000);
    }
  };

  // Handle Connect Fingerprint button
  const handleConnectFingerprint = async () => {
    if (!("serial" in navigator)) {
      setErrorMessage("Web Serial API not supported in this browser.");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }
    try {
      const port = await navigator.serial.requestPort({});
      await port.open({ baudRate: 115200 });
      window.fingerprintSerialPort = port;
      setFingerprintConnected(true);

      // Send UNIT_NAME command to request unit name
      try {
        const writer = port.writable.getWriter();
        const encoder = new TextEncoder();
        await writer.write(encoder.encode("UNIT_NAME\n"));
        writer.releaseLock();
      } catch (e) {
        console.error("Error sending UNIT_NAME command:", e);
        setErrorMessage("Error sending unit name request: " + e.message);
        setTimeout(() => setErrorMessage(""), 2000);
      }

      // Read unit name from serial with retries
      let unitName = "Unknown";
      let attempts = 3;
      try {
        const reader = port.readable.getReader();
        let buffer = '';
        const timeout = setTimeout(() => {
          reader.cancel();
          setErrorMessage("Failed to read unit name: Timeout");
          setTimeout(() => setErrorMessage(""), 2000);
        }, 5000); // Increased timeout to 5 seconds

        while (attempts > 0) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += new TextDecoder().decode(value);
          const match = buffer.match(/UnitName: (FPU\d{3})/);
          if (match) {
            unitName = match[1];
            clearTimeout(timeout);
            setFingerprintUnitName(unitName);
            console.log(`Unit Name set: ${unitName}`);
            break;
          }
          attempts--;
          if (attempts === 0) {
            clearTimeout(timeout);
            setErrorMessage("Failed to read unit name: No response after retries");
            setTimeout(() => setErrorMessage(""), 2000);
          }
        }
        reader.releaseLock();
      } catch (e) {
        console.error("Error reading unit name:", e);
        setErrorMessage("Error reading unit name: " + e.message);
        setTimeout(() => setErrorMessage(""), 2000);
      }
    } catch (error) {
      setErrorMessage("Connection failed: " + error.message);
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
                    if (!fingerprintConnected || !window.fingerprintSerialPort) {
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
                  backgroundColor: fingerprintConnected ? "#ff9800" : "#cccccc",
                  color: fingerprintConnected ? "white" : "#666666",
                  cursor: fingerprintConnected ? "pointer" : "not-allowed"
                }}
                title={!fingerprintConnected ? "Connect to a fingerprint unit first" : "Clean up unregistered fingerprints from R307 storage"}
              >
                Cleanup R307 Storage
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
    </Spin>
  );
};

export default Page2;