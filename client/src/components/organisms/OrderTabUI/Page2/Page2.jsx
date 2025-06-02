import React, { useState, useEffect } from "react";
import { Typography, Card, Spin, Dropdown, Menu } from "antd"; // Import Spin for loading animation and Dropdown, Menu for language selection
import styles from "./Page2.module.css"; // Import CSS module for styling
import DateAndTime from "../DateAndTime/DateAndTime"; // Import DateAndTime component
import translations from "../../../../utils/translations"; // Import language translations
import FingerPrint from "../../../atoms/FingerPrint/FingerPrint"; // Import FingerPrint component
import { MdLanguage } from "react-icons/md";
import { IoKeypadSharp } from "react-icons/io5";
import { BiFingerprint } from "react-icons/bi";

// Page2 component for user authentication via fingerprint or PIN
const Page2 = ({
  carouselRef,
  language,
  setLanguage,
  setUsername,
  setUserId,
  resetPin, // Add this prop
  setResetPin, // Add this prop
}) => {
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
  // State to track the selected language
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  // Menu for language selection with custom styles
  const languageMenu = (
    <Menu
      onClick={(e) => {
        setSelectedLanguage(e.key); // Update selected language
        setLanguage(e.key.toLowerCase()); // Update parent language state
      }}
      style={{
        background: "linear-gradient(135deg, #720000, #e30000)",
        color: "white",
        borderRadius: "8px",
      }}
    >
      <Menu.Item
        key="English"
        style={{ fontSize: "16px", padding: "10px 20px", color: "white" }}
      >
        English
      </Menu.Item>
      <Menu.Item
        key="සිංහල"
        style={{ fontSize: "16px", padding: "10px 20px", color: "white" }}
      >
        සිංහල
      </Menu.Item>
      <Menu.Item
        key="தமிழ்"
        style={{ fontSize: "16px", padding: "10px 20px", color: "white" }}
      >
        தமிழ்
      </Menu.Item>
    </Menu>
  );

  // Handle PIN digit input
  const handlePinInput = (digit) => {
    if (pin.length < 4) {
      setPin(pin + digit); // Append digit to PIN
    }
  };

  useEffect(() => {
    // Clear PIN when component mounts (when navigating back to Page2)
    setPin("");
    setErrorMessage("");
  }, []);

  // Clear PIN when resetPin prop becomes true
  useEffect(() => {
    if (resetPin) {
      setPin("");
      setErrorMessage("");
      setResetPin(false); // Reset the trigger
    }
  }, [resetPin, setResetPin]);

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
        setUsername({ name: user.name, gender: user.gender });
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
            Welcome to <span>Helix</span> Food Ordering
          </Typography.Title>
        </div>
        <div className={styles.dateAndTime}>
          <DateAndTime />
        </div>
        {/* Main card for authentication interface */}
        <div className={styles.full}>
          <Card className={styles.card} bodyStyle={{ padding: 3 }}>
            <div className={styles.content}>
              {showFingerprint ? (
                // Fingerprint authentication section
                <div className={styles.fingerprintSection}>
                  <div
                    className={styles.fingerprintScanner}
                    onClick={() => setScanning(true)}
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
                </div>
              ) : (
                // PIN input section
                <div className={styles.pinSection}>
                  <div className={styles.SectionTexts}>
                    {text.enterPin} {/* Prompt for PIN entry */}
                  </div>
                  <div className={styles.pinDots}>
                    {[0, 1, 2, 3].map((idx) => (
                      <span
                        key={idx}
                        className={`${styles.pinDot} ${
                          pin.length > idx ? styles.filled : ""
                        }`}
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
        <div className={styles.backButtonContainer}>
          <button
            className={styles.toggleButton}
            onClick={() => setShowFingerprint((prev) => !prev)} // Toggle the state
          >
            {showFingerprint ? (
              <IoKeypadSharp size={30} />
            ) : (
              <BiFingerprint size={30} />
            )}{" "}
            {/* Toggle icon */}
          </button>
          <button
            onClick={() => {
              carouselRef.current.goTo(0);
            }}
            className={styles.backButton}
          >
            <MdLanguage size={20} /> <div>{selectedLanguage}</div>{" "}
            {/* Display selected language */}
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
