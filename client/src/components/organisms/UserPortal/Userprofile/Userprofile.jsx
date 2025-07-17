import React, { useState, useRef, useEffect } from "react";
import { Input, Select, Radio, DatePicker } from "antd";
import { Camera, User } from "lucide-react";
import axios from "axios";
import moment from "moment"; // Import moment for date formatting
import styles from "./Userprofile.module.css";
import { useAuth } from "../../../../contexts/AuthContext";


// Destructuring Select component for cleaner code
const { Option } = Select;

// UserProfile component to display and edit user profile information
export default function UserProfile({ user }) {
  // State to toggle between edit and view mode
  const [isEditing, setIsEditing] = useState(false);
  // Ref for file input to handle image uploads
  const fileInputRef = useRef(null);
  // State for profile image
  const [profileImage, setProfileImage] = useState(user.profilePicture || null);
  // State for user data fetched from the database
  const [userData, setUserData] = useState(null);
  // State for password validation error message
  const [passwordError, setPasswordError] = useState("");
  // State to track if password has been updated
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  // State for phone number validation error message
  const [phoneError, setPhoneError] = useState("");
  // State for height validation error message
  const [heightError, setHeightError] = useState("");
  // State for weight validation error message
  const [weightError, setWeightError] = useState("");
      const { authData } = useAuth();
  const token = authData?.accessToken;

  // Function to validate password complexity
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!hasNumber) {
      return "Password must contain at least one number.";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character.";
    }
    return "";
  };

  // Handler for password input changes with validation
  const handlePasswordChange = (value) => {
    const error = validatePassword(value);
    setPasswordError(error);
    setPasswordUpdated(true); // Mark password as updated
    handleInputChange("password", value);
  };

  // Determine if the Save Changes button should be disabled
  const isSaveDisabled = isEditing && (passwordError || phoneError || heightError || weightError);

  // Fetch user data from the database
  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/${user.id}`,{headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      );
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Effect to fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Toggle between edit and save modes, and save changes to the database
  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        // Update user data via API call
        const response = await axios.put(
          `${import.meta.env.VITE_BASE_URL}/user/${userData.id}`,
          {
            name: userData.name,
            dob: userData.dob,
            telephone: userData.telephone,
            gender: userData.gender,
            address: userData.address,
            language: userData.language,
            height: parseInt(userData.height, 10),
            weight: parseInt(userData.weight, 10),
            password: userData.password,
          },{headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        );

        if (response.status === 200) {
          alert("User data updated successfully!");
          fetchUserData(); // Refresh data after saving
        }
      } catch (error) {
        console.error("Error updating user data:", error);
        alert("Failed to update user data. Please try again.");
      }
    }
    setIsEditing(!isEditing);
  };

  // Update user data state for input fields
  const handleInputChange = (field, value) => {
    setUserData({
      ...userData,
      [field]: value,
    });
  };

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click for image upload
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Show loading state until user data is fetched
  if (!userData) {
    return <div>Loading...</div>;
  }

  // Render the user profile UI
  return (
    <div className={styles.profileContainer}>
      {/* Header with title and edit/save button */}
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <button
          onClick={handleEditToggle}
          className={styles.editButton}
          disabled={isSaveDisabled}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      {/* Main content area */}
      <div className={styles.content}>
        <div className={styles.profileCard}>
          <div className={styles.profileImageSection}>
            {/* Fixed user data display as a table */}
            <table className={styles.fixedDataTable}>
              <tbody>
                <tr>
                  <td className={styles.fixedDataLabel}>Employee ID:</td>
                  <td className={styles.fixedDataValue}>{userData.id}</td>
                </tr>
                <tr>
                  <td className={styles.fixedDataLabel}>Email:</td>
                  <td className={styles.fixedDataValue}>{userData.email}</td>
                </tr>
                <tr>
                  <td className={styles.fixedDataLabel}>Job Role:</td>
                  <td className={styles.fixedDataValue}>{userData.role}</td>
                </tr>
                <tr>
                  <td className={styles.fixedDataLabel}>Fingerprint Passkey:</td>
                  <td className={styles.fixedDataValue}>{userData.passkey || 'Not set'}</td>
                </tr>
                <tr>
                  <td className={styles.fixedDataLabel}>Join Date:</td>
                  <td className={styles.fixedDataValue}>{userData.createdAt.split("T")[0]}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Form for editable user data */}
          <form className={styles.formGrid} onSubmit={(e) => e.preventDefault()}>
            {/* Full Name Input */}
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Full Name</label>
              <Input
                id="fullName"
                className={styles.inputMaxWidth}
                value={userData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {/* Password Input with Validation */}
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <Input.Password
                id="password"
                className={styles.inputMaxWidth}
                value={isEditing ? userData.password || "" : "••••••••••"}
                onChange={(e) => handlePasswordChange(e.target.value)}
                disabled={!isEditing}
              />
              {passwordError && <p className={styles.errorText}>{passwordError}</p>}
            </div>

            {/* Phone Number Input with Validation */}
            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <Input
                id="phoneNumber"
                className={styles.inputMaxWidth}
                value={userData.telephone}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,10}$/.test(value)) {
                    handleInputChange("telephone", value);
                    if (value.length !== 10) {
                      setPhoneError("Phone number must be exactly 10 digits.");
                    } else {
                      setPhoneError("");
                    }
                  }
                }}
                disabled={!isEditing}
                maxLength={10}
              />
              {phoneError && <p className={styles.errorText}>{phoneError}</p>}
            </div>

            {/* Birthday Input with DatePicker */}
            <div className={styles.formGroup}>
              <label htmlFor="birthday">Birthday</label>
              <DatePicker
                id="birthday"
                className={styles.inputMaxWidth}
                value={userData.dob ? moment(userData.dob, "YYYY-MM-DD") : null}
                onChange={(date, dateString) => handleInputChange("dob", dateString)}
                disabled={!isEditing}
                format="YYYY-MM-DD"
              />
            </div>

            {/* Preferred Language Select */}
            <div className={styles.formGroup}>
              <label htmlFor="preferredLanguage">Preferred Language</label>
              <Select
                id="preferredLanguage"
                className={styles.inputMaxWidth}
                value={userData.language}
                onChange={(value) => handleInputChange("language", value)}
                disabled={!isEditing}
              >
                <Option value="English">English</Option>
                <Option value="Tamil">Tamil</Option>
                <Option value="Sinhala">Sinhala</Option>
              </Select>
            </div>

            {/* Height Input with Validation */}
            <div className={styles.formGroup}>
              <label htmlFor="height">Height (cm)</label>
              <Input
                id="height"
                className={styles.inputMaxWidth}
                value={userData.height}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    handleInputChange("height", value);
                    if (value < 50 || value > 300) {
                      setHeightError("Height must be between 50 and 300 cm.");
                    } else {
                      setHeightError("");
                    }
                  }
                }}
                disabled={!isEditing}
              />
              {heightError && <p className={styles.errorText}>{heightError}</p>}
            </div>

            {/* Weight Input with Validation */}
            <div className={styles.formGroup}>
              <label htmlFor="weight">Weight (kg)</label>
              <Input
                id="weight"
                className={styles.inputMaxWidth}
                value={userData.weight}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    handleInputChange("weight", value);
                    if (value < 10 || value > 500) {
                      setWeightError("Weight must be between 10 and 500 kg.");
                    } else {
                      setWeightError("");
                    }
                  }
                }}
                disabled={!isEditing}
              />
              {weightError && <p className={styles.errorText}>{weightError}</p>}
            </div>

            {/* Gender Radio Group */}
            <div className={styles.formGroup}>
              <label>Gender</label>
              <Radio.Group
                value={userData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                disabled={!isEditing}
              >
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
                <Radio value="other">Other</Radio>
              </Radio.Group>
            </div>

            {/* Address Input */}
            <div className={styles.formGroup}>
              <label htmlFor="address">Address</label>
              <Input
                id="address"
                className={styles.inputMaxWidth}
                value={userData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}