import React, { useState,useEffect } from "react";
import { Typography, Card, Spin } from "antd"; // Import Spin for loading animation
import styles from "./Page2.module.css"; // Import CSS module for styling
import DateAndTime from "../DateAndTime/DateAndTime"; // Import DateAndTime component
import translations from "../../../../utils/translations"; // Import language translations
import FingerPrint from "../../../atoms/FingerPrint/FingerPrint"; // Import FingerPrint component
import { MdLanguage } from "react-icons/md";
import { IoKeypadSharp } from "react-icons/io5";

// Page2 component for user authentication via fingerprint or PIN
const Page2 = ({ carouselRef, language, setUsername, setUserId }) => {
  // State for error messages
  const [errorMessage, setErrorMessage] = useState("");
  // State for PIN input
  const [pin, setPin] = useState("");
  // Access translations based on selected language
  const text = translations[language];
  // State to indicate fingerprint scanning status
  const [scanning, setScanning] = useState(false);
  // State to toggle between fingerprint and PIN input views
  const [showFingerprint, setShowFingerprint] = useState(true);
  // State to control loading animation
  const [loading, setLoading] = useState(false);

  // Handle PIN digit input
  const handlePinInput = (digit) => {
    if (pin.length < 4) {
      setPin(pin + digit); // Append digit to PIN
    }
  };

  // Handle backspace to remove last PIN digit
  const handleBackspace = () => {
    setPin(pin.slice(0, -1)); // Remove last character
  };

  // Handle fingerprint authentication
  const handleFingerprint = () => {
    setScanning(true); // Show scanning animation
    setTimeout(() => {
      setScanning(false); // Stop scanning
      carouselRef.current.goTo(2); // Navigate to Page 3
    }, 3000); // Simulate 3-second scan
  };

  // Handle PIN submission and user authentication
  const handlePinSubmit = async () => {
    if (pin.length === 4) {
      setScanning(true); // Show loading state
      try {
        // Fetch user data based on PIN
        const response = await fetch(`http://localhost:3000/user/${pin}`);
        if (!response.ok) {
          throw new Error("User not found");
        }
        const user = await response.json();
        setUsername(user.name); // Set username in parent component
        setUserId(user.id); // Set user ID in parent component
        console.log("Retrieved Username:", user.name); // Log username
        console.log("Retrieved User ID:", user.id); // Log user ID

        // Navigate to Page 3 after a short delay
        setTimeout(() => {
          carouselRef.current.goTo(2);
        }, 100);
      } catch (error) {
        console.error("Error fetching user:", error);
        setErrorMessage(text.invalidPin); // Display error message
        setTimeout(() => setErrorMessage(""), 2000); // Clear error after 2 seconds
      } finally {
        setScanning(false); // Stop loading state
      }
    }
  };
   useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit();
    }
  }, [pin]); 

  // Render the authentication page
  return (
    <Spin spinning={loading} tip="Loading...">
      {" "}
      {/* Show loading animation when loading */}
      {/* Date and time display */}
      <div className={styles.full}>
        <div>
          <Typography.Title level={1} className={styles.mainTitle1}>
            Welcome to <span>Helix</span>  Food Ordering
          </Typography.Title>
        </div>
        <div className={styles.dateAndTime}>
          <DateAndTime />
        </div>
        {/* Main card for authentication interface */}
        <div>
          <Card className={styles.card} bodyStyle={{ padding:3 }}>
            <div className={styles.content}>
              {showFingerprint ? (
                // Fingerprint authentication section
                <div className={styles.fingerprintSection}>
                  <div
                    className={styles.fingerprintScanner}
                    onClick={handleFingerprint}
                  >
                    <FingerPrint /> {/* Fingerprint icon */}
                  </div>
                  <p>
                    {scanning ? (
                      <span className={styles.SectionTexts}>
                        Scanning...
                        <br />
                      </span>
                    ) : (
                      <span className={styles.SectionTexts}>
                        {text.fingerprint} {/* Prompt for fingerprint scan */}
                      </span>
                    )}
                  </p>
                  {/* Button to switch to PIN input */}
                </div>
              ) : (
                // PIN input section
                <div className={styles.pinSection}>
                  <div className={styles.SectionTexts}>
                    {text.enterPin} {/* Prompt for PIN entry */}
                  </div>
                  <Typography.Text
                    className={styles.pinInput}
                    strong // Bold text for PIN display
                  >
                    {pin.padEnd(4, "•")}{" "}
                    {/* Display PIN with dots for missing digits */}
                  </Typography.Text>
                  {/* Numeric keypad for PIN input */}
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
                    {/* Button to append "E" to PIN */}
                    <button
                      type="default"
                      shape="circle"
                      size="large"
                      onClick={() => handlePinInput("E")}
                    >
                      E
                    </button>
                    {/* Backspace button */}
                    <button
                      type="default"
                      shape="circle"
                      size="large"
                      onClick={handleBackspace}
                    >
                      ⮌
                    </button>
                  </div>
                  {/* Submit PIN button */}

                  {/* Button to switch to fingerprint authentication */}

                </div>
              )}
            </div>
            <br />
            {/* Back button to reload the page */}

            <br />
          </Card>
        </div>
        <div className={styles.backButtonContainer}>
          <button
            className={styles.toggleButton}
            onClick={() => setShowFingerprint(false)}
          >
            <IoKeypadSharp size={30} />
          </button>
          <button
            className={styles.backButton}
            onClick={() => window.location.reload()}
          >
            <MdLanguage size={20} /> <div>{text.back}</div>
          </button>
        </div>
      </div>
      {/* Error message popup */}
      {errorMessage && <div className={styles.errorPopup}>{errorMessage}</div>}
    </Spin>
  );
};

// Export the Page2 component
export default Page2;
