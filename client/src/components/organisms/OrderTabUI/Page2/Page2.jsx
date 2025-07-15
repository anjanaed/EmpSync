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
    if (pin.length < 4) {
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
        console.log("Serial data received:", text);
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
      const response = await fetch(`http://localhost:3000/user-finger-print-register-backend/fingerprint?thumbid=${fingerId}`);
      if (!response.ok) {
        throw new Error("Fingerprint not found");
      }
      const fingerprint = await response.json();
      const empId = fingerprint.empId;
      if (!empId) {
        throw new Error("No employee ID found for this fingerprint");
      }
      const userResponse = await fetch(`http://localhost:3000/user/${empId}`);
      if (!userResponse.ok) {
        throw new Error("User not found for this employee ID");
      }
      const user = await userResponse.json();
      setUsername({ name: user.name, gender: user.gender });
      setUserId(user.id);
      console.log("Retrieved Username:", user.name);
      console.log("Retrieved User ID:", user.id);
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
    if (pin.length === 4) {
      setScanning(true);
      try {
        const response = await fetch(`http://localhost:3000/user/${pin}`);
        if (!response.ok) {
          throw new Error("User not found");
        }
        const user = await response.json();
        setUsername({ name: user.name, gender: user.gender });
        setUserId(user.id);
        console.log("Retrieved Username:", user.name);
        console.log("Retrieved User ID:", user.id);
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
    if (pin.length === 4) {
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
                  <div className={styles.fingerprintScanner} onClick={handleFingerprint}>
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
                    {[0, 1, 2, 3].map((idx) => (
                      <span
                        key={idx}
                        className={`${styles.pinDot} ${pin.length > idx ? styles.filled : ""}`}
                      />
                    ))}
                  </div>
                  <div className={styles.pinButtons}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                      <button
                        key={digit}
                        type="primary"
                        shape="circle"
                        size="large"
                        onClick={() => handlePinInput(digit.toString())}
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="default"
                      shape="circle"
                      size="large"
                      onClick={() => handlePinInput("E")}
                    >
                      E
                    </button>
                    <button
                      type="default"
                      shape="circle"
                      size="large"
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
            {!fingerprintConnected && (
              <button
                className={styles.connectFingerprintButton}
                onClick={handleConnectFingerprint}
              >
                Connect FingerPrint
              </button>
            )}
            {fingerprintConnected && (
              <div style={{ fontWeight: "bold", color: "#4CAF50", marginTop: 8 }}>
                UNIT NAME: {fingerprintUnitName}
              </div>
            )}
            <button
              className={styles.registerButton}
              onClick={() => navigate("/user-fingerprint-register")}
            >
              New User Register
            </button>
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
      {errorMessage && <div className={styles.errorPopup}>{errorMessage}</div>}
    </Spin>
  );
};

export default Page2;