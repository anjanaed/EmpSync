import React, { useState, useRef, useEffect } from "react";
import { Input, Select, Radio } from "antd"; // Import Ant Design Input, Select, and Radio
import { Camera, User } from "lucide-react";
import styles from "./Userprofile.module.css";

const { TextArea } = Input; // Destructure TextArea from Input
const { Option } = Select; // Destructure Option from Select

export default function UserProfile({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(user.profilePicture || null);

  const [userData, setUserData] = useState({
    employeeId: user.id,
    email: user.email,
    jobRole: user.role,
    joinDate: user.createdAt.split("T")[0], // Format date
    fullName: user.name,
    password: "••••••••", // Masked password
    salary: user.salary || "N/A",
    phoneNumber: user.telephone || "N/A",
    birthday: user.dob || "N/A",
    preferredLanguage: user.language || "N/A",
    address: user.address || "N/A",
    gender: user.gender || "N/A",
    height: user.height || "N/A",
    weight: user.weight || "N/A",
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
            <div className={styles.fixedData}>
              <p><strong>Employee ID:</strong> {userData.employeeId}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Job Role:</strong> {userData.jobRole}</p>
              <p><strong>Join Date:</strong> {userData.joinDate}</p>
            </div>
          </div>

          <form className={styles.formGrid} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Full Name</label>
              <Input
                id="fullName"
                className={styles.inputMaxWidth}
                value={userData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <Input.Password
                id="password"
                className={styles.inputMaxWidth}
                value={userData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <Input
                id="phoneNumber"
                className={styles.inputMaxWidth}
                value={userData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="birthday">Birthday</label>
              <Input
                id="birthday"
                className={styles.inputMaxWidth}
                value={userData.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="preferredLanguage">Preferred Language</label>
              <Select
                id="preferredLanguage"
                className={styles.inputMaxWidth}
                value={userData.preferredLanguage}
                onChange={(value) => handleInputChange("preferredLanguage", value)}
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
                onChange={(e) => handleInputChange("height", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="weight">Weight (kg)</label>
              <Input
                id="weight"
                className={styles.inputMaxWidth}
                value={userData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                disabled={!isEditing}
              />
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

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton} disabled={!isEditing}>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
