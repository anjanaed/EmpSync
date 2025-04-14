import React, { useState, useEffect } from 'react';
import { Typography, Card } from 'antd';
import styles from './Page2.module.css'; 
import DateAndTime from '../DateAndTime/DateAndTime';
import FingerPrint from '../../atoms/FingerPrint/FingerPrint';

const Page2 = ({ carouselRef, language }) => { // Accept language as a prop
    
    const [pin, setPin] = useState("");
    const [scanning, setScanning] = useState(false);

    

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
            localStorage.setItem("user", "John Wick");
            // Add navigation logic here if needed
        }, 2000);
    };

    const handlePinSubmit = () => {
        if (pin.length === 4) {
            localStorage.setItem("user", "John Wick");
            // Add navigation logic here if needed
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
        },
        sinhala: {
            title: "පරිශීලක සත්‍යාපනය",
            fingerprint: "ඇඟිලි සලකුණු ස්කෑනරය මත ඔබේ ඇඟිල්ල තබන්න",
            enterPin: "PIN අංකය ඇතුලත් කරන්න",
            back: "ආපසු",
            submit: "ඉදිරිපත් කරන්න",
            clear: "මකන්න",
        },
        tamil: {
            title: "பயனர் அங்கீகாரம்",
            fingerprint: "கைரேகை ஸ்கேனரில் உங்கள் விரலை வைக்கவும்",
            enterPin: "பின்னை உள்ளிடவும்",
            back: "பின்னால்",
            submit: "சமர்ப்பி",
            clear: "அழி",
        },
    };

    const text = translations[language]; // Use the selected language

    return (
        <>
            <div>
                <DateAndTime />
            </div>
            <br />
            <div>
                <Card className={styles.card}>
                    <Typography.Title level={1}>
                        <div className={styles.title}>{text.title}</div>
                        <hr />
                    </Typography.Title>
                    <div className={styles.content}>
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
                        </div>
                        <Typography.Title level={1}>
                            <div className={styles.title}>Or</div>
                        </Typography.Title>
                        <div className={styles.pinSection}>
                            <div className={styles.SectionTexts}>
                                {text.enterPin}
                            </div>
                            <input
                                type="password"
                                value={pin}
                                readOnly
                                className={styles.pinInput}
                            />
                            <div className={styles.pinButtons}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                                    <button
                                        key={digit}
                                        onClick={() => handlePinInput(digit.toString())}
                                    >
                                        {digit}
                                    </button>
                                ))}
                                <br />
                                <button onClick={handleBackspace}>←</button>
                                <br />
                            </div>
                            <button
                                className={styles.pinButtonSubmit}
                                onClick={handlePinSubmit}
                                disabled={pin.length !== 4}
                            >
                                {text.submit}
                            </button>
                            <br />
                        </div>
                    </div>
                </Card>
            </div>
            <div className={styles.backButtonContainer}>
                <button
                    className={styles.backButton}
                    onClick={() => carouselRef.current.goTo(0)}
                >
                    ← {text.back}
                </button>
            </div>
        </>
    );
};

export default Page2;