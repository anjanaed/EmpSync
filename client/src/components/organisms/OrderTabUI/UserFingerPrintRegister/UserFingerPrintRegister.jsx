import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserFingerPrintRegister.module.css";
// import bgImage from "../../../../assets/Login/loginbackground.png";
import otbImage from "../../../../assets/Order/otb1.jpg";

import fingerprintIcon from "../../../../assets/Order/fingerprints-icons-5897.png";
import FingerPrint from "../../../atoms/FingerPrint/FingerPrint.jsx";
import FingerprintBLE from "../../../../utils/fingerprintBLE.js";

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

    // BLE communication state for fingerprint registration
    const [registerStatus, setRegisterStatus] = useState("Tap here and then place your finger on the scanner");
    const [registerSteps, setRegisterSteps] = useState([]); // Array of step messages
    const fingerprintBLERef = useRef(null);
    const [bleConnected, setBleConnected] = useState(false);
    
    // User fingerprint state
    const [userFingerprints, setUserFingerprints] = useState([]);
    const [registeredFingersOnCurrentUnit, setRegisteredFingersOnCurrentUnit] = useState(0);
    
    // R307 module state tracking
    const [moduleStoredIds, setModuleStoredIds] = useState([]);
    const [nextAvailableId, setNextAvailableId] = useState(null);
    const [enrollmentTargetId, setEnrollmentTargetId] = useState(null);
    const [verificationAttempts, setVerificationAttempts] = useState(0);

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
                        setUserFingerprints([]);
                        setRegisteredFingersOnCurrentUnit(0);
                        // Clear organization data
                        window.userOrganizationId = null;
                        window.currentRegistrationUser = null;
                        return;
                    }
                    const data = await response.json();
                    setUser(data);
                    // Store user data globally to persist during registration
                    window.currentRegistrationUser = data;
                    
                    // Log user info and passkey
                    console.log("Correct passkey entered:", passkey);
                    if (data && data.id && data.name) {
                        console.log("Fetched user ID:", data.id);
                        console.log("Fetched user name:", data.name);
                        
                        // Set organizationId globally for browser access
                        if (data.organizationId) {
                            window.userOrganizationId = data.organizationId;
                            console.log("User organizationId set:", data.organizationId);
                        } else {
                            window.userOrganizationId = null;
                            console.log("No organizationId found for user");
                        }
                        
                        // Fetch user's existing fingerprints
                        await fetchUserFingerprints(data.id);
                    }
                } catch (err) {
                    setError("Invalid Pass Key, check Again");
                    setUser(null);
                    setUserFingerprints([]);
                    setRegisteredFingersOnCurrentUnit(0);
                    // Clear organization data on error
                    window.userOrganizationId = null;
                    window.currentRegistrationUser = null;
                }
            } else {
                setError("");
                setUser(null);
                setUserFingerprints([]);
                setRegisteredFingersOnCurrentUnit(0);
                // Clear organization data when pin is cleared
                window.userOrganizationId = null;
                window.currentRegistrationUser = null;
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

    // Fetch user's existing fingerprints
    const fetchUserFingerprints = async (userId) => {
        try {
            // First try to get all fingerprints and then filter by empId
            const response = await fetch(`/user-finger-print-register-backend/all-fingerprints`);
            if (response.ok) {
                const allFingerprints = await response.json();
                // Filter fingerprints for this specific user
                const userFingerprints = allFingerprints.filter(fp => fp.empId === userId);
                setUserFingerprints(userFingerprints);
                console.log("Fetched user fingerprints:", userFingerprints);
                
                // Analyze fingerprints for current unit
                analyzeRegisteredFingers(userFingerprints);
            } else {
                console.log("No existing fingerprints found or error fetching fingerprints");
                setUserFingerprints([]);
                setRegisteredFingersOnCurrentUnit(0);
            }
        } catch (error) {
            console.error("Error fetching user fingerprints:", error);
            setUserFingerprints([]);
            setRegisteredFingersOnCurrentUnit(0);
        }
    };

    // Analyze registered fingers for current unit
    const analyzeRegisteredFingers = (fingerprints) => {
        if (!window.fingerprintUnitName || !fingerprints.length) {
            setRegisteredFingersOnCurrentUnit(0);
            return;
        }

        // Filter fingerprints that match the current unit
        const currentUnitFingerprints = fingerprints.filter(fp => {
            // Extract first 6 characters (unit name) from thumbid
            const unitName = fp.thumbid.substring(0, 6);
            return unitName === window.fingerprintUnitName;
        });

        console.log(`Found ${currentUnitFingerprints.length} registered fingers on unit ${window.fingerprintUnitName}`);
        setRegisteredFingersOnCurrentUnit(currentUnitFingerprints.length);
    };

    // --- BLE Communication Functions ---
    
    // Check R307 module storage and determine next available ID
    const checkModuleStorageAndGetNextId = async () => {
        try {
            if (!fingerprintBLERef.current || !fingerprintBLERef.current.getConnectionStatus()) {
                throw new Error('BLE connection not available');
            }
            
            setRegisterStatus('Checking R307 storage...');
            console.log('🔍 Checking R307 module storage before enrollment');
            
            // Reset state
            setModuleStoredIds([]);
            setNextAvailableId(null);
            setEnrollmentTargetId(null);
            
            // Use the enhanced BLE method if available
            if (fingerprintBLERef.current.sendCommandAndWaitForResponse) {
                try {
                    console.log('📤 Using enhanced BLE method to get storage info');
                    const response = await fingerprintBLERef.current.sendCommandAndWaitForResponse('GET_IDS', 'IDS:', 8000);
                    const result = processStorageInfo(response);
                    return result;
                } catch (error) {
                    console.warn('Enhanced BLE method failed, falling back to standard method:', error);
                    // Fall through to standard method
                }
            }
            
            // Standard method with manual response handling
            console.log('📤 Using standard BLE method to get storage info');
            await fingerprintBLERef.current.sendCommand('GET_IDS');
            console.log('📤 Sent GET_IDS command to R307 module');
            
            // Wait for IDS response with timeout
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout waiting for R307 storage information'));
                }, 8000);
                
                // Set up temporary handler for IDS response
                const originalHandler = fingerprintBLERef.current.onDataCallback;
                fingerprintBLERef.current.onData((data) => {
                    // Call original handler first
                    if (originalHandler) originalHandler(data);
                    
                    // Check for IDS response
                    if (data.includes('IDS:')) {
                        clearTimeout(timeout);
                        // Restore original handler
                        if (originalHandler) {
                            fingerprintBLERef.current.onData(originalHandler);
                        }
                        
                        try {
                            const result = processStorageInfo(data);
                            resolve(result);
                        } catch (error) {
                            reject(error);
                        }
                    }
                });
            });
            
        } catch (error) {
            console.error('❌ Error checking R307 storage:', error);
            setRegisterStatus('Error checking fingerprint storage: ' + error.message);
            throw error;
        }
    };
    
    // Process storage information from R307 module
    const processStorageInfo = (data) => {
        try {
            const idsMatch = data.match(/IDS:([\d,]*)/);
            if (!idsMatch) {
                throw new Error('Invalid IDS response format');
            }
            
            const idsStr = idsMatch[1];
            let storedIds = [];
            
            if (idsStr.length > 0) {
                storedIds = idsStr.split(',')
                    .map(id => id.trim())
                    .filter(id => id.length > 0)
                    .map(id => parseInt(id, 10))
                    .filter(id => !isNaN(id))
                    .sort((a, b) => a - b);
            }
            
            setModuleStoredIds(storedIds);
            console.log('📋 R307 stored IDs:', storedIds);
            
            // Find next available ID (starting from 1)
            let nextId = 1;
            while (storedIds.includes(nextId)) {
                nextId++;
            }
            
            // Validate ID is within reasonable range (R307 typically supports 1-1000)
            if (nextId > 1000) {
                throw new Error('R307 storage is full (maximum 1000 fingerprints)');
            }
            
            setNextAvailableId(nextId);
            setEnrollmentTargetId(nextId);
            
            console.log(`✅ Next available ID determined: ${nextId}`);
            console.log(`📊 R307 storage: ${storedIds.length}/1000 slots used`);
            
            return {
                storedIds,
                nextAvailableId: nextId,
                storageUsed: storedIds.length,
                storageCapacity: 1000
            };
            
        } catch (error) {
            console.error('❌ Error processing storage info:', error);
            throw error;
        }
    };
    
    // Verify enrollment completed with expected ID
    const verifyEnrollmentId = async (reportedId) => {
        try {
            const expectedId = enrollmentTargetId;
            if (!expectedId) {
                console.warn('⚠️ No target ID set for verification');
                return true; // Skip verification if no target set
            }
            
            console.log(`🔍 Verifying enrollment: Expected ID ${expectedId}, Reported ID ${reportedId}`);
            
            if (parseInt(reportedId, 10) !== expectedId) {
                console.error(`❌ ID Mismatch! Expected: ${expectedId}, Got: ${reportedId}`);
                
                // Increment verification attempts
                const attempts = verificationAttempts + 1;
                setVerificationAttempts(attempts);
                
                if (attempts >= 3) {
                    throw new Error(`Critical: R307 assigned wrong ID ${reportedId} instead of ${expectedId} after ${attempts} attempts`);
                }
                
                // Try to delete the wrongly assigned ID and retry
                console.log(`🔄 Attempting to fix ID mismatch (attempt ${attempts}/3)`);
                setRegisterStatus(`ID mismatch detected. Fixing... (${attempts}/3)`);
                
                // Delete the wrong ID
                await fingerprintBLERef.current.sendCommand(`DELETE_ID:${reportedId}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Re-check storage and retry enrollment
                await checkModuleStorageAndGetNextId();
                return false; // Indicate retry needed
            }
            
            console.log('✅ Enrollment ID verification passed');
            setVerificationAttempts(0); // Reset on success
            return true;
            
        } catch (error) {
            console.error('❌ Error verifying enrollment ID:', error);
            throw error;
        }
    };
    
    // Check and use existing ESP32 BLE connection from global window object
    const checkExistingBLEConnection = () => {
        if (window.fingerprintBLEInstance && window.fingerprintBLEInstance.getConnectionStatus() && !fingerprintBLERef.current) {
            fingerprintBLERef.current = window.fingerprintBLEInstance;
            setBleConnected(true);
            console.log("Using existing BLE fingerprint connection from Page2");
            
            // Set up data handler for registration
            fingerprintBLERef.current.onData((data) => {
                processBLEMessage(data);
            });
            
            // Restore unit name if available
            if (window.fingerprintUnitName) {
                console.log("Restored unit name:", window.fingerprintUnitName);
            }
            
            return true;
        }
        return false;
    };

    // Connect to ESP32 via Web Bluetooth API (fallback if no existing connection)
    const connectESP32BLE = async () => {
        try {
            // First check if there's already a connection from Page2
            if (checkExistingBLEConnection()) {
                return;
            }

            if (!fingerprintBLERef.current) {
                const bleInstance = new FingerprintBLE();
                
                if (!bleInstance.isSupported()) {
                    setRegisterStatus('Web Bluetooth API not supported in this browser.');
                    return;
                }
                
                await bleInstance.connect();
                fingerprintBLERef.current = bleInstance;
                window.fingerprintBLEInstance = bleInstance; // Store globally for consistency
                setBleConnected(true);
                
                // Set up data handler for registration
                bleInstance.onData((data) => {
                    processBLEMessage(data);
                });
                
                console.log("New BLE fingerprint connection established for registration");
            }
        } catch (error) {
            setRegisterStatus('BLE Connection failed: ' + error.message);
        }
    };

    // Process incoming BLE messages
    const processBLEMessage = async (data) => {
        const lines = data.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line) {
                console.log('Registration BLE data:', line);
                
                // Handle storage information response
                if (line.startsWith('IDS:')) {
                    // This is handled by checkModuleStorageAndGetNextId
                    continue;
                }
                
                // Registration steps and status (show only one at a time)
                if (line.includes('Waiting for valid finger to enroll as')) {
                    // Extract the ID that the module is trying to assign
                    const idMatch = line.match(/enroll as #(\d+)/);
                    if (idMatch) {
                        const assignedId = parseInt(idMatch[1], 10);
                        console.log(`📍 R307 wants to assign ID: ${assignedId}`);
                        console.log(`📍 Expected ID: ${enrollmentTargetId}`);
                        
                        if (enrollmentTargetId && assignedId !== enrollmentTargetId) {
                            console.warn(`⚠️ ID Mismatch during enrollment setup! Expected: ${enrollmentTargetId}, Module assigned: ${assignedId}`);
                            setRegisterStatus(`ID conflict detected. Rechecking storage...`);
                            
                            // Re-check storage to ensure consistency
                            try {
                                await checkModuleStorageAndGetNextId();
                                setRegisterStatus("Storage rechecked. Place your finger on the scanner");
                            } catch (error) {
                                setRegisterStatus("❌ Error rechecking storage: " + error.message);
                                setScanning(false);
                                return;
                            }
                        } else {
                            setRegisterStatus("Place your finger on the scanner");
                        }
                    } else {
                        setRegisterStatus("Place your finger on the scanner");
                    }
                    setRegisterSteps([line]);
                } else if (line.includes('Image taken')) {
                    setRegisterStatus("Image captured successfully");
                    setRegisterSteps([line]);
                } else if (line.includes('Image converted')) {
                    setRegisterStatus("Processing fingerprint...");
                    setRegisterSteps([line]);
                } else if (line.includes('Remove finger')) {
                    setRegisterStatus("Remove your finger and wait");
                    setRegisterSteps([line]);
                } else if (line.includes('Place same finger again')) {
                    setRegisterStatus("Place the same finger again");
                    setRegisterSteps([line]);
                } else if (line.includes('Prints matched!')) {
                    setRegisterStatus("Fingerprints matched! Storing...");
                    setRegisterSteps([line]);
                } else if (line.includes('Stored!')) {
                    setRegisterStatus("✅ Fingerprint registered successfully!");
                    setRegisterSteps([line]);
                } else if (line.includes('Fingerprints did not match')) {
                    setRegisterStatus("❌ Fingerprints did not match. Try again.");
                    setRegisterSteps([line]);
                } else if (line.includes('Image too messy')) {
                    setRegisterStatus("❌ Image quality too poor. Try again.");
                    setRegisterSteps([line]);
                } else if (line.includes('Could not find fingerprint features')) {
                    setRegisterStatus("❌ Could not detect fingerprint. Try again.");
                    setRegisterSteps([line]);
                }
                
                // Handle registration completion with verification
                if (line.includes('ThumbID Registered')) {
                    console.log("Registration completed:", line);
                    
                    // Extract thumbID and the internal ID
                    const thumbIdMatch = line.match(/ThumbID Registered: (FPU\d{7})/);
                    const internalIdMatch = line.match(/ThumbID Registered: FPU\d{3}(\d{4})/);
                    
                    if (thumbIdMatch && internalIdMatch) {
                        const thumbId = thumbIdMatch[1];
                        const internalId = parseInt(internalIdMatch[1], 10);
                        
                        console.log("Extracted thumbId:", thumbId);
                        console.log("Extracted internal ID:", internalId);
                        
                        try {
                            // Verify the assigned ID matches our expectation
                            const verificationPassed = await verifyEnrollmentId(internalId);
                            
                            if (!verificationPassed) {
                                console.log("🔄 Verification failed, retrying enrollment...");
                                setRegisterStatus("ID mismatch detected. Retrying...");
                                
                                // Restart enrollment process
                                setTimeout(async () => {
                                    try {
                                        await startEnroll();
                                    } catch (error) {
                                        console.error("Error retrying enrollment:", error);
                                        setRegisterStatus("❌ Retry failed: " + error.message);
                                        setScanning(false);
                                    }
                                }, 2000);
                                return;
                            }
                            
                            // Verification passed, proceed with database save
                            setRegisterStatus("✅ Registration verified! Saving...");
                            
                            // Check both current user state and stored user data
                            const currentUser = user || window.currentRegistrationUser;
                            
                            if (currentUser) {
                                console.log("User ID (empId):", currentUser.id);
                                console.log("Organization ID:", window.userOrganizationId);
                                
                                const baseURL = import.meta.env.VITE_BASE_URL || '';
                                const response = await fetch(`${baseURL}/user-finger-print-register-backend/register`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        empId: currentUser.id,
                                        thumbid: thumbId
                                    })
                                });
                                
                                if (response.ok) {
                                    const result = await response.json();
                                    console.log("Fingerprint saved to database successfully:", result);
                                    setRegisterStatus("✅ Fingerprint registered and saved!");
                                    
                                    // Update module storage tracking
                                    const newStoredIds = [...moduleStoredIds, internalId].sort((a, b) => a - b);
                                    setModuleStoredIds(newStoredIds);
                                    
                                    // Refresh user fingerprints to update the button states
                                    await fetchUserFingerprints(currentUser.id);
                                    
                                    // Show success alert and return to fingerprint options
                                    setTimeout(() => {
                                        alert("Fingerprint registered successfully!");
                                        setShowFingerprintSection(false);
                                        setScanning(false);
                                        setRegisterStatus("Tap here and then place your finger on the scanner");
                                        setRegisterSteps([]);
                                        setVerificationAttempts(0);
                                        
                                        // Dispatch event to inform other components
                                        window.dispatchEvent(new CustomEvent('fingerprintRegistrationComplete'));
                                    }, 1000);
                                } else {
                                    const errorData = await response.json().catch(() => ({}));
                                    console.error("Failed to save fingerprint to database:", errorData);
                                    setRegisterStatus("❌ Registration failed: " + (errorData.message || 'Database error'));
                                }
                            } else {
                                console.error("Missing user data");
                                setRegisterStatus("❌ Registration failed. Missing user data.");
                            }
                            
                        } catch (verificationError) {
                            console.error("Verification error:", verificationError);
                            setRegisterStatus("❌ Verification failed: " + verificationError.message);
                            setScanning(false);
                        }
                        
                    } else {
                        console.error("Failed to extract thumbId or internal ID from:", line);
                        setRegisterStatus("❌ Registration failed. Invalid response format.");
                    }
                }
            }
        }
    };

    // Send command via BLE
    const sendBLECommand = async (command) => {
        try {
            if (fingerprintBLERef.current && fingerprintBLERef.current.getConnectionStatus()) {
                console.log(`Attempting to send BLE command: ${command}`);
                await fingerprintBLERef.current.sendCommand(command);
                console.log(`Successfully sent BLE command: ${command}`);
            } else {
                setRegisterStatus('Not connected to ESP32 via BLE');
                console.error('BLE connection not available');
            }
        } catch (error) {
            setRegisterStatus('Error sending BLE command: ' + error.message);
            console.error('BLE command error:', error);
        }
    };

    // Debug function to log current state
    const logCurrentState = () => {
        console.log('📊 Current Registration State:');
        console.log('  🔗 BLE Connected:', bleConnected);
        console.log('  👤 User:', user?.name || 'None');
        console.log('  🏷️ Unit Name:', window.fingerprintUnitName || 'Unknown');
        console.log('  📦 Stored IDs in R307:', moduleStoredIds);
        console.log('  🎯 Next Available ID:', nextAvailableId);
        console.log('  🎪 Target Enrollment ID:', enrollmentTargetId);
        console.log('  🔄 Verification Attempts:', verificationAttempts);
        console.log('  📊 Registered Fingers on Unit:', registeredFingersOnCurrentUnit);
        console.log('  📝 Current Status:', registerStatus);
        console.log('  ⚡ Scanning:', scanning);
    };

    // Make debug function available globally for easier debugging
    React.useEffect(() => {
        window.debugFingerprintRegistration = logCurrentState;
        return () => {
            delete window.debugFingerprintRegistration;
        };
    }, [bleConnected, user, moduleStoredIds, nextAvailableId, enrollmentTargetId, verificationAttempts, registeredFingersOnCurrentUnit, registerStatus, scanning]);

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
                        
                        // Refresh user fingerprints to update the button states
                        if (user && user.id) {
                            await fetchUserFingerprints(user.id);
                        }
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
                
                // Notify Page2 that registration is complete and it can resume reading
                window.dispatchEvent(new CustomEvent('fingerprintRegistrationComplete'));
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
        try {
            // Check for existing connection first
            if (checkExistingBLEConnection()) {
                setRegisterStatus('Using existing BLE connection...');
            } else {
                setRegisterStatus('Connecting to ESP32 via BLE...');
                setRegisterSteps([]);
                await connectESP32BLE();
            }
            
            setScanning(true);
            setRegisterStatus('Preparing for enrollment...');
            setRegisterSteps(['Preparing for enrollment...']);
            
            // First, check R307 storage and determine next available ID
            console.log('🔍 Checking R307 storage before enrollment...');
            setRegisterStatus('Checking fingerprint storage...');
            
            try {
                const storageInfo = await checkModuleStorageAndGetNextId();
                console.log(`✅ Storage check complete. Next ID: ${storageInfo.nextAvailableId}`);
                console.log(`📊 Storage usage: ${storageInfo.storageUsed}/${storageInfo.storageCapacity}`);
                
                // Log current state for debugging
                logCurrentState();
                
                // Update status with storage info
                setRegisterStatus(`Ready to enroll (ID ${storageInfo.nextAvailableId}, ${storageInfo.storageUsed}/${storageInfo.storageCapacity} used)`);
                
                // Brief delay to show storage info
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Now start enrollment
                setRegisterStatus('Starting enrollment...');
                setRegisterSteps(['Starting enrollment...']);
                await sendBLECommand('ENROLL');
                
                console.log(`✅ Enrollment started. Expected ID: ${enrollmentTargetId}`);
                
            } catch (storageError) {
                console.error('❌ Error checking storage:', storageError);
                logCurrentState(); // Log state on error too
                setRegisterStatus('❌ Error checking storage: ' + storageError.message);
                setScanning(false);
                throw storageError;
            }
            
        } catch (error) {
            console.error('❌ Error starting enrollment:', error);
            setRegisterStatus('❌ Error starting enrollment: ' + error.message);
            setScanning(false);
            throw error;
        }
    };

    // Check for existing connection on component mount
    React.useEffect(() => {
        const hasConnection = checkExistingBLEConnection();
        if (hasConnection) {
            console.log("BLE Fingerprint connection restored on mount");
        }
        
        // Listen for connection changes from other components
        const handleConnectionChange = (event) => {
            console.log("Received BLE connection change event:", event.detail);
            if (event.detail.connected && event.detail.device) {
                fingerprintBLERef.current = window.fingerprintBLEInstance;
                setBleConnected(true);
            } else {
                fingerprintBLERef.current = null;
                setBleConnected(false);
            }
        };
        
        window.addEventListener('fingerprintBLEConnectionChanged', handleConnectionChange);
        
        // Set up a periodic check to ensure connection state is accurate
        const checkInterval = setInterval(() => {
            const currentlyConnected = window.fingerprintBLEInstance && window.fingerprintBLEInstance.getConnectionStatus();
            if (currentlyConnected !== bleConnected) {
                setBleConnected(currentlyConnected);
                if (currentlyConnected) {
                    fingerprintBLERef.current = window.fingerprintBLEInstance;
                } else {
                    fingerprintBLERef.current = null;
                }
            }
        }, 1000);
        
        return () => {
            window.removeEventListener('fingerprintBLEConnectionChanged', handleConnectionChange);
            clearInterval(checkInterval);
        };
    }, [bleConnected]);

    // Re-analyze fingerprints when unit name changes
    React.useEffect(() => {
        if (userFingerprints.length > 0) {
            analyzeRegisteredFingers(userFingerprints);
        }
    }, [window.fingerprintUnitName, userFingerprints]);

    // Cleanup BLE on unmount
    React.useEffect(() => {
        return () => {
            // Don't close the global BLE connection as it might be used by Page2
            // Only reset local references
            if (fingerprintBLERef.current) {
                fingerprintBLERef.current = null;
            }
            
            // Clear organization data when component unmounts
            window.userOrganizationId = null;
            window.currentRegistrationUser = null;
            
            // Reset verification state
            setModuleStoredIds([]);
            setNextAvailableId(null);
            setEnrollmentTargetId(null);
            setVerificationAttempts(0);
        };
    }, []);

    // Reset verification state when user changes
    React.useEffect(() => {
        setModuleStoredIds([]);
        setNextAvailableId(null);
        setEnrollmentTargetId(null);
        setVerificationAttempts(0);
    }, [user?.id]);

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
                        {/* Connection Status */}
                        <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                            Status: <span style={{ color: bleConnected ? '#4CAF50' : '#f44336' }}>
                                {bleConnected ? '✓ Fingerprint Unit Connected' : '✗ Fingerprint Unit Not Connected'}
                            </span>
                        </div>
                        <span className={styles.SectionTexts}>
                            {registerStatus || (scanning ? 'Scanning...' : 'Please place your finger on the scanner')}
                        </span>
                    </p>
                    <div
                        className={styles.fingerprintScanner}
                        onClick={() => {
                            if (!scanning) {
                                if (bleConnected) {
                                    // Reset verification state before starting new enrollment
                                    setVerificationAttempts(0);
                                    setRegisterSteps([]);
                                    
                                    startEnroll().catch(error => {
                                        console.error('Error starting enrollment:', error);
                                        setRegisterStatus('❌ Error starting enrollment: ' + error.message);
                                        setScanning(false);
                                    });
                                } else {
                                    setRegisterStatus('Please connect to fingerprint device first');
                                    setTimeout(() => setRegisterStatus('Please place your finger on the scanner'), 2000);
                                }
                            }
                        }}
                        style={{ 
                            cursor: scanning ? 'not-allowed' : (bleConnected ? 'pointer' : 'not-allowed'), 
                            opacity: (scanning || !bleConnected) ? 0.6 : 1 
                        }}
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
                            
                            // Notify Page2 that registration is cancelled and it can resume reading
                            window.dispatchEvent(new CustomEvent('fingerprintRegistrationComplete'));
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
                    {/* Connection Status */}
                    <div style={{ marginTop: '15px', fontSize: '14px', fontWeight: 'bold' }}>
                        Device Status: <span style={{ color: bleConnected ? '#4CAF50' : '#f44336' }}>
                            {bleConnected ? '✓ Connected' : '✗ Not Connected'}
                        </span>
                        {bleConnected && (
                            <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal', marginTop: '5px' }}>
                                Ready to register fingerprints
                            </div>
                        )}
                        {bleConnected && window.fingerprintUnitName && (
                            <div style={{ fontSize: '12px', color: '#333', fontWeight: 'normal', marginTop: '5px' }}>
                                Unit: {window.fingerprintUnitName} | Registered fingers: {registeredFingersOnCurrentUnit}/2
                                {moduleStoredIds.length > 0 && (
                                    <span style={{ marginLeft: '10px', color: '#666' }}>
                                        (R307: {moduleStoredIds.length} stored)
                                    </span>
                                )}
                                {nextAvailableId && (
                                    <span style={{ marginLeft: '10px', color: '#2196F3' }}>
                                        Next ID: {nextAvailableId}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.fingerprintButtonGroup + " " + styles.fingerprintOptions}>
                    <button
                        type="button"
                        className={styles.fingerprintButton + " " + styles.fingerprintButtonOne}
                        onClick={() => setShowFingerprintSection(true)}
                        disabled={!bleConnected || registeredFingersOnCurrentUnit >= 1}
                        style={{
                            opacity: (bleConnected && registeredFingersOnCurrentUnit < 1) ? 1 : 0.5,
                            cursor: (bleConnected && registeredFingersOnCurrentUnit < 1) ? "pointer" : "not-allowed"
                        }}
                        title={
                            !bleConnected 
                                ? "Connect to fingerprint device first" 
                                : registeredFingersOnCurrentUnit >= 1 
                                    ? "Finger 1 already registered on this unit" 
                                    : "Register finger 1"
                        }
                    >
                        <img
                            src={fingerprintIcon}
                            alt="Register Fingerprint"
                            className={styles.fingerprintImg + " " + styles.fingerprintImgSmall}
                        />
                        <span className={styles.fingerprintLabel + " " + styles.fingerprintLabelBlue}>
                            {registeredFingersOnCurrentUnit >= 1 ? (
                                <>
                                    Finger 01
                                    <br /><br />
                                    Registered
                                </>
                            ): "Finger 01"}
                        </span>
                    </button>
                    <button
                        type="button"
                        className={styles.fingerprintButton + " " + styles.fingerprintButtonTwo}
                        onClick={() => setShowFingerprintSection(true)}
                        disabled={!bleConnected || registeredFingersOnCurrentUnit >= 2}
                        style={{
                            opacity: (bleConnected && registeredFingersOnCurrentUnit < 2) ? 1 : 0.5,
                            cursor: (bleConnected && registeredFingersOnCurrentUnit < 2) ? "pointer" : "not-allowed"
                        }}
                        title={
                            !bleConnected 
                                ? "Connect to fingerprint device first" 
                                : registeredFingersOnCurrentUnit >= 2 
                                    ? "Finger 2 already registered on this unit" 
                                    : "Register finger 2"
                        }
                    >
                        <img
                            src={fingerprintIcon}
                            alt="Register Fingerprint"
                            className={styles.fingerprintImg + " " + styles.fingerprintImgSmall}
                        />
                        <span className={styles.fingerprintLabel + " " + styles.fingerprintLabelOrange}>
                            {registeredFingersOnCurrentUnit >= 2 ? (
                                <>
                                    Finger 02
                                    <br /><br />
                                    Registered
                                </>
                            ) : "Finger 02"}
                        </span>
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