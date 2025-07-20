import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserFingerPrintRegister.module.css";
// import bgImage from "../../../../assets/Login/loginbackground.png";
import otbImage from "../../../../assets/Order/otb1.jpg";

import fingerprintIcon from "../../../../assets/Order/fingerprints-icons-5897.png";
import FingerPrint from "../../../atoms/FingerPrint/FingerPrint.jsx";

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

    // Serial communication state for fingerprint registration
    const [registerStatus, setRegisterStatus] = useState("Please place your finger on the scanner");
    const [registerSteps, setRegisterSteps] = useState([]); // Array of step messages
    const serialPortRef = useRef(null);
    const serialReaderRef = useRef(null);
    const [serialConnected, setSerialConnected] = useState(false);

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

    // --- Serial Communication Functions ---
    // Connect to ESP32 via Web Serial API
    const connectESP32 = async () => {
        try {
            if (!('serial' in navigator)) {
                setRegisterStatus('Web Serial API not supported in this browser.');
                return;
            }
            if (!serialPortRef.current) {
                const port = await navigator.serial.requestPort({});
                await port.open({ baudRate: 115200 });
                serialPortRef.current = port;
                setSerialConnected(true);
                readSerial();
            }
        } catch (error) {
            setRegisterStatus('Connection failed: ' + error.message);
        }
    };

    // Read from serial port
    const readSerial = async () => {
        if (!serialPortRef.current) return;
        const reader = serialPortRef.current.readable.getReader();
        serialReaderRef.current = reader;
        let buffer = '';
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += new TextDecoder().decode(value);
                let lines = buffer.split('\n');
                buffer = lines.pop();
                for (let line of lines) {
                    line = line.trim();
                    if (line) processSerialMessage(line);
                }
            }
        } catch (e) {
            // Ignore for now
        } finally {
            reader.releaseLock();
        }
    };

    // Write to serial port
    const writeSerial = async (data) => {
        if (serialPortRef.current && serialPortRef.current.writable) {
            const writer = serialPortRef.current.writable.getWriter();
            await writer.write(new TextEncoder().encode(data + '\n'));
            writer.releaseLock();
        } else {
            setRegisterStatus('Not connected to ESP32');
        }
    };

    // Process incoming serial messages
    const processSerialMessage = async (data) => {
        console.log('Received:', data);
        // Registration steps and status (show only one at a time)
        if (data.includes('Waiting for valid finger to enroll as')) {
            setRegisterStatus('Place your finger on the scanner');
        } else if (data.includes('Image taken')) {
            setRegisterStatus('Image taken. Remove your finger.');
        } else if (data.includes('Remove finger')) {
            setRegisterStatus('Remove your finger from the scanner');
        } else if (data.includes('Place same finger again')) {
            setRegisterStatus('Place the same finger again');
        } else if (data.includes('First image conversion failed')) {
            setRegisterStatus('First image conversion failed. Try again.');
        } else if (data.includes('Second image conversion failed')) {
            setRegisterStatus('Second image conversion failed. Try again.');
        } else if (data.includes('Fingerprints did not match')) {
            setRegisterStatus('Fingerprints did not match. Try again.');
        } else if (data.includes('ThumbID Registered')) {
            setRegisterStatus('Fingerprint registered successfully!');
            // Extract thumbid (e.g., FPU0020001)
            const match = data.match(/(FPU\d{7})/);
            if (match && user && user.id) {
                const thumbid = match[1];
                const empId = user.id;
                try {
                    const response = await fetch('/user-finger-print-register-backend/fingerprint', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ thumbid, empId })
                    });
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        setRegisterStatus('Failed to save fingerprint: ' + (errorData.message || response.statusText));
                    } else {
                        setRegisterStatus('Fingerprint registered and saved!');
                    }
                } catch (err) {
                    setRegisterStatus('Error saving fingerprint: ' + err.message);
                }
            }
            // Show alert and auto-back
            setTimeout(() => {
                alert("User's Finger Registered Successfully");
                setShowFingerprintSection(false);
                setScanning(false);
                setRegisterStatus('Please place your finger on the scanner');
                setRegisterSteps([]);
            }, 100);
        } else if (data.includes('No available IDs')) {
            setRegisterStatus('No available IDs for enrollment.');
        } else if (data.includes('Communication error')) {
            setRegisterStatus('Communication error.');
        } else if (data.includes('Imaging error')) {
            setRegisterStatus('Imaging error.');
        } else if (data.includes('Unknown error')) {
            setRegisterStatus('Unknown error.');
        }
        // Always log the message
        if (data.includes('ThumbID Registered')) {
            // Example: "FPU0010002 ThumbID Registered"
            console.log('Received:', data);
        }
    };

    // Start registration process
    const startEnroll = async () => {
        setRegisterStatus('Connecting to ESP32...');
        setRegisterSteps([]);
        await connectESP32();
        setScanning(true);
        setRegisterStatus('Starting enrollment...');
        setRegisterSteps(['Starting enrollment...']);
        await writeSerial('ENROLL');
    };

    // Cleanup serial on unmount
    React.useEffect(() => {
        return () => {
            if (serialPortRef.current) {
                serialPortRef.current.close();
                serialPortRef.current = null;
            }
        };
    }, []);

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
                        <span className={styles.SectionTexts}>
                            {registerStatus || (scanning ? 'Scanning...' : 'Please place your finger on the scanner')}
                        </span>
                    </p>
                    <div
                        className={styles.fingerprintScanner}
                        onClick={() => {
                            if (!scanning) startEnroll();
                        }}
                        style={{ cursor: scanning ? 'not-allowed' : 'pointer', opacity: scanning ? 0.6 : 1 }}
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
                            setRegisterStatus('Please place your finger on the scanner');
                            setRegisterSteps([]);
                        }}
                        style={{position: 'fixed', right: 32, bottom: 32, zIndex: 1000}}
                    >
                        Back
                    </button>
                </div>
            );
        }
        return (
            <div className={styles.pinSection + " " + styles.pinSectionOverride}>
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
                <div className={styles.SectionTexts + " " + styles.userGreeting}>
                    <h2 className={styles.subHeading1}>
                        {user && user.name ? `Hello..! ${user.name} ` : null}
                    </h2>
                    You can register two fingers on the device.
                </div>
                <div className={styles.fingerprintButtonGroup + " " + styles.fingerprintOptions}>
                    <button
                        type="button"
                        className={styles.fingerprintButton + " " + styles.fingerprintButtonOne}
                        onClick={() => setShowFingerprintSection(true)}
                    >
                        <img
                            src={fingerprintIcon}
                            alt="Register Fingerprint"
                            className={styles.fingerprintImg + " " + styles.fingerprintImgSmall}
                        />
                        <span className={styles.fingerprintLabel + " " + styles.fingerprintLabelBlue}>Finger 01</span>
                    </button>
                    <button
                        type="button"
                        className={styles.fingerprintButton + " " + styles.fingerprintButtonTwo}
                        onClick={() => setShowFingerprintSection(true)}
                    >
                        <img
                            src={fingerprintIcon}
                            alt="Register Fingerprint"
                            className={styles.fingerprintImg + " " + styles.fingerprintImgSmall}
                        />
                        <span className={styles.fingerprintLabel + " " + styles.fingerprintLabelOrange}>Finger 02</span>
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