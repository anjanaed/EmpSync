import React, { useState, useRef } from "react";
import { Input, Select, Radio } from "antd"; // Import Ant Design Input, Select, and Radio
import { Camera, User } from "lucide-react";
// import styles from "./Userprofile.module.css";

const { TextArea } = Input; // Destructure TextArea from Input
const { Option } = Select; // Destructure Option from Select

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
            
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Full Name</label>
              <Input
                id="fullName"
                className={styles.inputMaxWidth} // Apply the max-width class
                value={userData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <Input.Password
                id="password"
                className={styles.inputMaxWidth} // Apply the max-width class
                value={userData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <Input
                id="phoneNumber"
                className={styles.inputMaxWidth} // Apply the max-width class
                value={userData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="birthday">Birthday</label>
              <Input
                id="birthday"
                className={styles.inputMaxWidth} // Apply the max-width class
                value={userData.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="preferredLanguage">Preferred Language</label>
              <Select
                id="preferredLanguage"
                className={styles.inputMaxWidth} // Apply the max-width class
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
                className={styles.inputMaxWidth} // Apply the max-width class
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
                className={styles.inputMaxWidth} // Apply the max-width class
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
