import React, { useState, useRef, useEffect } from "react";
import { Input, Select, Radio, DatePicker } from "antd";
import { Camera, User } from "lucide-react";
import axios from "axios";
import moment from "moment"; // Import moment for date formatting
import styles from "./Userprofile.module.css";

const { Option } = Select;

export default function UserProfile({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(user.profilePicture || null);
  const [userData, setUserData] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [passwordUpdated, setPasswordUpdated] = useState(false); // Track if the password is updated
  const [phoneError, setPhoneError] = useState(""); // Track phone number validation errors
  const [heightError, setHeightError] = useState(""); // Track height validation errors
  const [weightError, setWeightError] = useState(""); // Track weight validation errors

  // Function to validate password
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

  // Update the onChange handler
  const handlePasswordChange = (value) => {
    const error = validatePassword(value);
    setPasswordError(error);
    setPasswordUpdated(true); // Mark password as updated
    handleInputChange("password", value);
  };

  // Disable the "Save Changes" button if password is invalid or not updated
  const isSaveDisabled = isEditing && (passwordError || phoneError || heightError || weightError);

  // Fetch user data from the database
  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/${user.id}`
      );
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData(); // Fetch user data on component mount
  }, []);

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        // API call to update user data in the database
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
          }
        );

        if (response.status === 200) {
          alert("User data updated successfully!");
          fetchUserData(); // Fetch updated data after saving
        }
      } catch (error) {
        console.error("Error updating user data:", error);
        alert("Failed to update user data. Please try again.");
      }
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setUserData({
      ...userData,
      [field]: value,
    });
  };

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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!userData) {
    return <div>Loading...</div>; // Show a loading state until user data is fetched
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <button
          onClick={handleEditToggle}
          className={styles.editButton}
          disabled={isSaveDisabled} // Disable the button based on the condition
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.profileCard}>
          <div className={styles.profileImageSection}>
            {/* <div className={styles.profileAvatar}>
              <img
                src={profileImage || "/placeholder.svg"}
                alt="Profile"
                className={styles.avatarImage}
              />
              {!profileImage && <User />}
              {isEditing && (
                <div className={styles.uploadControls}>
                  <button onClick={triggerFileInput} className={styles.uploadButton}>
                    <Camera className="mr-2" />
                    Upload Photo
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className={styles.fileInput}
                  />
                </div>
              )}
            </div> */}
            <div className={styles.fixedData}>
              <p><strong>Employee ID:</strong> {userData.id}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Job Role:</strong> {userData.role}</p>
              <p><strong>Join Date:</strong> {userData.createdAt.split("T")[0]}</p>
            </div>
          </div>

          <form className={styles.formGrid} onSubmit={(e) => e.preventDefault()}>
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

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <Input.Password
                id="password"
                className={styles.inputMaxWidth}
                value={isEditing ? userData.password || "" : "••••••••••"} // Show 10 dots when not editing
                onChange={(e) => handlePasswordChange(e.target.value)}
                disabled={!isEditing}
              />
              {passwordError && <p className={styles.errorText}>{passwordError}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <Input
                id="phoneNumber"
                className={styles.inputMaxWidth}
                value={userData.telephone}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and ensure the length is 10 digits
                  if (/^\d{0,10}$/.test(value)) {
                    handleInputChange("telephone", value);
                    if (value.length !== 10) {
                      setPhoneError("Phone number must be exactly 10 digits.");
                    } else {
                      setPhoneError(""); // Clear the error if valid
                    }
                  }
                }}
                disabled={!isEditing}
                maxLength={10} // Ensure the input field doesn't accept more than 10 characters
              />
              {phoneError && <p className={styles.errorText}>{phoneError}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="birthday">Birthday</label>
              <DatePicker
                id="birthday"
                className={styles.inputMaxWidth}
                value={userData.dob ? moment(userData.dob, "YYYY-MM-DD") : null} // Format the date
                onChange={(date, dateString) => handleInputChange("dob", dateString)} // Update state with formatted date
                disabled={!isEditing}
                format="YYYY-MM-DD" // Ensure the date format remains consistent
              />
            </div>

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

            <div className={styles.formGroup}>
              <label htmlFor="height">Height (cm)</label>
              <Input
                id="height"
                className={styles.inputMaxWidth}
                value={userData.height}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) { // Allow only numbers
                    handleInputChange("height", value);
                    if (value < 50 || value > 300) {
                      setHeightError("Height must be between 50 and 300 cm.");
                    } else {
                      setHeightError(""); // Clear the error if valid
                    }
                  }
                }}
                disabled={!isEditing}
              />
              {heightError && <p className={styles.errorText}>{heightError}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="weight">Weight (kg)</label>
              <Input
                id="weight"
                className={styles.inputMaxWidth}
                value={userData.weight}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) { // Allow only numbers
                    handleInputChange("weight", value);
                    if (value < 10 || value > 500) {
                      setWeightError("Weight must be between 10 and 500 kg.");
                    } else {
                      setWeightError(""); // Clear the error if valid
                    }
                  }
                }}
                disabled={!isEditing}
              />
              {weightError && <p className={styles.errorText}>{weightError}</p>}
            </div>

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
