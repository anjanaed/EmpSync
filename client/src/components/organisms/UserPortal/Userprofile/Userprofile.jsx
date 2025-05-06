import React, { useState, useRef } from "react";
import { CalendarIcon, Camera, User } from "lucide-react";
import styles from "./Userprofile.module.css";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);

  // Mock user data
  const [userData, setUserData] = useState({
    employeeId: "EMP12345",
    email: "john.doe@empsync.com",
    jobRole: "Senior Developer",
    joinDate: "2023-01-15",
    fullName: "John Doe",
    password: "••••••••",
    salary: "75000",
    phoneNumber: "+1 (555) 123-4567",
    birthday: "1990-05-15",
    preferredLanguage: "English",
    address: "123 Main Street, Anytown, USA",
    gender: "male",
    height: "175",
    weight: "70",
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Save data logic here
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

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <button onClick={handleEditToggle} className={styles.editButton}>
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.profileCard}>
          <div className={styles.profileImageSection}>
            <div className={styles.profileAvatar}>
              <img
                src={profileImage || "/placeholder.svg"}
                alt="Profile"
                className={styles.avatarImage}
              />
              {!profileImage && <User />}
            </div>
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
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                value={userData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={userData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                value={userData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="birthday">Birthday</label>
              <input
                id="birthday"
                value={userData.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                value={userData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
