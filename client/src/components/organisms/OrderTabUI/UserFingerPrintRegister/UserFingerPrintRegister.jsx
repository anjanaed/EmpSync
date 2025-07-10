
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
    const [showFingerprintSection, setShowFingerprintSection] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    // Fetch user info when pin is 6 digits
    React.useEffect(() => {
        const fetchUser = async () => {
            if (pin.length === 6 && /^\d{6}$/.test(pin)) {
                try {
                    setError("");
                    setUser(null);
                    const passkey = parseInt(pin, 10);
                    const response = await fetch(
                        `/user-finger-print-register-backend/user-by-passkey?passkey=${passkey}`
                    );
                    if (!response.ok) {
                        setError("Invalid Pass Key, check Again");
                        setUser(null);
                        return;
                    }
                    const data = await response.json();
                    setUser(data);
                    // Log user info and passkey
                    console.log("Correct passkey entered:", passkey);
                    if (data && data.id && data.name) {
                        console.log("Fetched user ID:", data.id);
                        console.log("Fetched user name:", data.name);
                    }
                } catch (err) {
                    setError("Invalid Pass Key, check Again");
                    setUser(null);
                }
            } else {
                setError("");
                setUser(null);
            }
        };
        fetchUser();
    }, [pin]);

    const handlePinInput = (digit) => {
        if (pin.length < 6) {
            setPin(pin + digit);
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    // Only allow moving forward if user is found and no error
    if (pin.length === 6 && user && !error) {
        if (showFingerprintSection) {
            return (
                <div className={styles.fingerprintSection} style={{position: 'relative'}}>
                    {/* Close Button */}
                    <button
                        onClick={() => navigate('/OrderTab')}
                        className={styles.page2CloseButton}
                        aria-label="Close"
                    >
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="28" height="28" rx="7" fill="#23272F"/>
                            <path d="M9.5 9.5L18.5 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M18.5 9.5L9.5 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <p>
                        <br />
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
                    <div
                        className={styles.fingerprintScanner}
                        onClick={() => setScanning(true)}
                    >
                        <div className={styles.fingerprintAnimationWrapper}>
                            <FingerPrint />
                        </div>
                    </div>
                    <button
                        className={styles.fingerprintBackButton + ' ' + styles.page2NavButton}
                        onClick={() => {
                            setShowFingerprintSection(false);
                            setScanning(false);
                        }}
                        style={{position: 'fixed', right: 32, bottom: 32, zIndex: 1000}}
                    >
                        Back
                    </button>
                </div>
            );
        }
        return (
            <div className={styles.pinSection} style={{ background: "none", position: 'relative' }}>
                {/* Close Button */}
                <button
                    onClick={() => navigate('/OrderTab')}
                    className={styles.page2CloseButton}
                    aria-label="Close"
                >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="28" height="28" rx="7" fill="#23272F"/>
                        <path d="M9.5 9.5L18.5 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M18.5 9.5L9.5 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
                <div className={styles.SectionTexts} style={{ fontSize: '1.5rem', width: '100%', textAlign: 'center', background: "none" }}>
                    You can register two fingers on the device.
                </div>
                <div
                    className={styles.fingerprintButtonGroup}
                    style={{ display: 'flex', gap: '7rem', justifyContent: 'center', marginTop: '2rem', marginBottom: '2rem' }}
                >
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
                <button
                    className={styles.fingerprintBackButton + ' ' + styles.page2NavButton}
                    onClick={() => setPin("")}
                    style={{position: 'fixed', right: 32, bottom: 32, zIndex: 1000}}
                >
                    Back
                </button>
            </div>
        );
    }

    // If pin is 6 digits but user not found, show error and block forward
    if (pin.length === 6 && error) {
        return (
            <div className={styles.pinSection} style={{position: 'relative'}}>
                {/* Close Button */}
                <button
                    onClick={() => navigate('/OrderTab')}
                    className={styles.page2CloseButton}
                    aria-label="Close"
                >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="28" height="28" rx="7" fill="#23272F"/>
                        <path d="M9.5 9.5L18.5 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M18.5 9.5L9.5 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
                <div className={styles.SectionTexts} style={{ color: 'red', fontWeight: 'bold', margin: '1rem 0', textAlign: 'center' }}>{error}</div>
                <div className={styles.pinDigits}>
                    {[...Array(6)].map((_, idx) => (
                        <span key={idx} className={styles.pinDigitBox}>
                            {pin[idx] || ""}
                        </span>
                    ))}
                </div>
                <button
                    className={styles.fingerprintBackButton + ' ' + styles.page2NavButton}
                    onClick={() => setPin("")}
                    style={{position: 'fixed', right: 32, bottom: 32, zIndex: 1000}}
                >
                    Back
                </button>
            </div>
        );
    }

    // Default: pin entry UI
    return (
        <div className={styles.pinSection} style={{position: 'relative'}}>
            {/* Close Button */}
            <button
                onClick={() => navigate('/OrderTab')}
                className={styles.page2CloseButton}
                aria-label="Close"
            >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="28" height="28" rx="7" fill="#23272F"/>
                    <path d="M9.5 9.5L18.5 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M18.5 9.5L9.5 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>
            <div className={styles.SectionTexts}>Enter 6-digit Pin Number</div>
            <div className={styles.pinDigits}>
                {[...Array(6)].map((_, idx) => (
                    <span key={idx} className={styles.pinDigitBox}>
                        {pin[idx] || ""}
                    </span>
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
    );
}
export default UserFingerPrintRegister;

// Only one default export