import React, { useState } from 'react';
import { Typography, Card, Spin } from 'antd'; // Import Spin for loading animation
import styles from './Page2.module.css';
import DateAndTime from '../DateAndTime/DateAndTime';
// filepath: c:\Users\hasha\Documents\GitHub\EmpSync\client\src\components\organisms\OrderTabUI\Page2\Page2.jsx
import FingerPrint from "../../../atoms/FingerPrint/FingerPrint";

const Page2 = ({ carouselRef, language, setUsername, setUserId }) => {
    const [errorMessage, setErrorMessage] = useState(""); // State for error messages
    const [pin, setPin] = useState("");
    const [scanning, setScanning] = useState(false);
    const [showFingerprint, setShowFingerprint] = useState(true); // State to toggle views
    const [loading, setLoading] = useState(false); // State for loading animation

    const handlePinInput = (digit) => {
        if (pin.length < 4) {
            setPin(pin + digit);
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const handleFingerprint = () => {
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            carouselRef.current.goTo(2); // Navigate to Page 3
        }, 3000);
    };

    const handlePinSubmit = async () => {
        if (pin.length === 4) {
            setScanning(true);
            try {
                const response = await fetch(`http://localhost:3000/user/${pin}`);
                if (!response.ok) {
                    throw new Error("User not found");
                }
                const user = await response.json();
                setUsername(user.name); // Pass the username to OrderTab.jsx
                setUserId(user.id); // Pass the user ID to OrderTab.jsx
                console.log("Retrieved Username:", user.name); // Log the username
                console.log("Retrieved User ID:", user.id); // Log the user ID

                // Navigate to Page 3
                setTimeout(() => {
                    carouselRef.current.goTo(2); // Navigate to Page 3
                }, 100);
            } catch (error) {
                console.error("Error fetching user:", error);
                setErrorMessage(text.invalidPin); // Set the error message
                setTimeout(() => setErrorMessage(""), 2000); // Clear the error message after 3 seconds
            } finally {
                setScanning(false);
            }
        }
    };

    const translations = {
        english: {
            title: "User Authentication",
            fingerprint: "Place Your Finger on Fingerprint Scanner",
            enterPin: "Enter PIN",
            back: "Back",
            submit: "Submit",
            clear: "Clear",
            loginWithPin: "Login with PIN Number",
            loginWithFingerprint: "Login with Fingerprint",
            invalidPin: "Invalid pin Number, Try again",
        },
        sinhala: {
            title: "පරිශීලක සත්‍යාපනය",
            fingerprint: "ඇඟිලි සලකුණු ස්කෑනරය මත ඔබේ ඇඟිල්ල තබන්න",
            enterPin: "PIN අංකය ඇතුලත් කරන්න",
            back: "ආපසු",
            submit: "ඉදිරිපත් කරන්න",
            clear: "මකන්න",
            loginWithPin: "PIN අංකය සමඟ පිවිසෙන්න",
            loginWithFingerprint: "ඇඟිලි සලකුණු සමඟ පිවිසෙන්න",
            invalidPin: "අවලංගු PIN අංකය, නැවත උත්සාහ කරන්න",
        },
        tamil: {
            title: "பயனர் அங்கீகாரம்",
            fingerprint: "கைரேகை ஸ்கேனரில் உங்கள் விரலை வைக்கவும்",
            enterPin: "பின்னை உள்ளிடவும்",
            back: "பின்னால்",
            submit: "சமர்ப்பி",
            clear: "அழி",
            loginWithPin: "பின்னுடன் உள்நுழைக",
            loginWithFingerprint: "கைரேகையுடன் உள்நுழைக",
            invalidPin: "தவறான PIN எண், மீண்டும் முயற்சிக்கவும்",
        },
    };

    const text = translations[language]; // Use the selected language

    return (
        <Spin spinning={loading} tip="Loading..."> {/* Show loading animation */}
            <div className={styles.dateAndTime}>
                <DateAndTime />
            </div>

            <div>
                <Card className={styles.card}>
                    <Typography.Title level={1}>
                        <div className={styles.title}>{text.title}</div>
                        <hr />
                    </Typography.Title>
                    <div className={styles.content}>
                        {showFingerprint ? (
                            <div className={styles.fingerprintSection}>
                                <div
                                    className={styles.fingerprintScanner}
                                    onClick={handleFingerprint}
                                >
                                    <FingerPrint />
                                </div>
                                <p>
                                    {scanning ? (
                                        <span className={styles.SectionTexts}>
                                            Scanning...<br />
                                        </span>
                                    ) : (
                                        <span className={styles.SectionTexts}>
                                            {text.fingerprint}
                                        </span>
                                    )}
                                </p>
                                <button
                                    className={styles.toggleButton}
                                    onClick={() => setShowFingerprint(false)}
                                >
                                    {text.loginWithPin}
                                </button>
                            </div>
                        ) : (
                            <div className={styles.pinSection}>
                                <div className={styles.SectionTexts}>
                                    {text.enterPin}
                                </div>
                                <Typography.Text
                                    className={styles.pinInput}
                                    strong // Makes the text bold
                                >
                                    {pin.padEnd(4, '•')} {/* Display the PIN with placeholders for missing digits */}
                                </Typography.Text>
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
                                        onClick={() => handlePinInput("E")} // Append "E" to the pin
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
                                <button
                                    className={styles.toggleButton}
                                    onClick={handlePinSubmit}
                                    disabled={pin.length !== 4}
                                >
                                    {text.submit}
                                </button>

                                <button
                                    className={styles.toggleButton}
                                    onClick={() => setShowFingerprint(true)}
                                >
                                    {text.loginWithFingerprint}
                                </button>
                            </div>
                        )}
                    </div>
                    <br />
                    <div className={styles.backButtonContainer}>
                        <button
                            className={styles.backButton}
                            onClick={() => window.location.reload()}
                        >
                            ← {text.back}
                        </button>
                    </div>
                    <br />
                </Card>
            </div>

            {/* Move the errorPopup outside the Card */}
                        {errorMessage && (
                            <div className={styles.errorPopup}>
                                {errorMessage}
                            </div>
                        )}
        </Spin>
    );
};

export default Page2;