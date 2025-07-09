
import React, { useState } from "react";
import styles from "./UserFingerPrintRegister.module.css";
// import bgImage from "../../../../assets/Login/loginbackground.png";
import otbImage from "../../../../assets/Order/otb1.jpg";

import fingerprintIcon from "../../../../assets/Order/fingerprints-icons-5897.png";
import FingerPrint from "../../../atoms/FingerPrint/FingerPrint";

const UserFingerPrintRegister = () => {
    return (
        <div
            className={styles.full}
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${otbImage})`,
            }}
        >
            <div>
                <h1 className={styles.mainTitle1}>
                    Welcome to <span>Helix</span> Food Ordering
                </h1>
                <h2 className={styles.subHeading}>
                    New User Register on FingerPrint Device
                </h2>
            </div>
            <div className={styles.content}>
                <PinSection />
            </div>
        </div>
    );
};

function PinSection() {
    const [pin, setPin] = useState("");

    const handlePinInput = (digit) => {
        if (pin.length < 6) {
            setPin(pin + digit);
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const [showFingerprintSection, setShowFingerprintSection] = useState(false);
    const [scanning, setScanning] = useState(false);

    if (pin.length === 6) {
        if (showFingerprintSection) {
            return (
                <div className={styles.fingerprintSection}>
                    <div
                        className={styles.fingerprintScanner}
                        onClick={() => setScanning(true)}
                    >
                        <div className={styles.fingerprintAnimationWrapper}>
                            <FingerPrint />
                        </div>
                    </div>
                    <p>
                        {scanning ? (
                            <span className={styles.SectionTexts}>
                                Scanning...
                                <br />
                            </span>
                        ) : (
                            <span className={styles.SectionTexts}>
                                Please place your finger on the scanner
                            </span>
                        )}
                    </p>
                    <div className={styles.fingerprintBackButtonRow}>
                        <button
                            className={styles.fingerprintBackButton}
                            onClick={() => {
                                setShowFingerprintSection(false);
                                setScanning(false);
                            }}
                        >
                            Back
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className={styles.pinSection} style={{ background: "none" }}>
                <div className={styles.SectionTexts} style={{ fontSize: '2rem', width: '100%', textAlign: 'center', background: "none" }}>
                    Register Finger Print
                </div>
                <div className={styles.fingerprintButtonGroup}>
                    <button
                        type="button"
                        className={styles.fingerprintButton}
                        onClick={() => setShowFingerprintSection(true)}
                    >
                        <img
                            src={fingerprintIcon}
                            alt="Register Fingerprint"
                            className={styles.fingerprintImg}
                        />
                        <span className={styles.fingerprintLabel}>Finger 01</span>
                    </button>
                    <button
                        type="button"
                        className={styles.fingerprintButton}
                        onClick={() => setShowFingerprintSection(true)}
                    >
                        <img
                            src={fingerprintIcon}
                            alt="Register Fingerprint"
                            className={styles.fingerprintImg}
                        />
                        <span className={styles.fingerprintLabel}>Finger 02</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pinSection}>
            <div className={styles.SectionTexts}>Enter 6-digit Pin Number</div>
            <div className={styles.pinDigits}>
                {[...Array(6)].map((_, idx) => (
                    <span key={idx} className={styles.pinDigitBox}>
                        {pin[idx] || ""}
                    </span>
                ))}
            </div>
            <div className={styles.pinButtons}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
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
    );
}
export default UserFingerPrintRegister;

// Only one default export