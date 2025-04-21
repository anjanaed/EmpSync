import React, { useState, useEffect } from "react";
import styles from "./AttendanceAuth.module.css";
import FingerPrint from "../../../../components/atoms/FingerPrint/FingerPrint"; 
import { ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    // Update date and time every second
    const interval = setInterval(() => {
      const now = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setCurrentDateTime(now.toLocaleDateString("en-US", options));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePinInput = (digit) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    // Handle PIN submission logic here
    console.log("PIN submitted:", pin);
    // Reset PIN after submission
    setPin("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.dateTime}>{currentDateTime}</div>

      <div className={styles.authCard}>
        <h1 className={styles.title}>User Authentication</h1>
        <div className={styles.divider}></div>

        <div className={styles.authMethods}>
          <div className={styles.fingerprintSection}>
            <div className={styles.fingerprintContainer}>
              <FingerPrint className={styles.fingerprintIcon} /> {/* Updated to use the custom FingerPrint component */}
            </div>
            <p className={styles.fingerprintText}>Place Your Finger on Fingerprint Scanner</p>
          </div>

          <div className={styles.orDivider}>
            <span>Or</span>
          </div>

          <div className={styles.pinSection}>
            <h2 className={styles.pinTitle}>Enter PIN</h2>

            <input type="password" className={styles.pinInput} value={pin} readOnly placeholder="" />

            <div className={styles.keypad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button key={num} className={styles.keypadButton} onClick={() => handlePinInput(num.toString())}>
                  {num}
                </button>
              ))}
              <button className={styles.keypadButton} onClick={() => handlePinInput("0")}>
                0
              </button>
              <button className={`${styles.keypadButton} ${styles.backspaceButton}`} onClick={handleBackspace}>
                <ArrowLeft size={20} />
              </button>
            </div>

            <button className={styles.submitButton} onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}