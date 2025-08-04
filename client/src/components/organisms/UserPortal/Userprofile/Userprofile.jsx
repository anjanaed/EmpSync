import React, { useState, useRef, useEffect } from "react";
import { Edit3, Calendar, User, Mail, Phone, MapPin, Weight, Ruler, IdCard, Briefcase, Fingerprint, UserPlus } from 'lucide-react';
import axios from "axios";
import moment from "moment";
import { useAuth } from "../../../../contexts/AuthContext.jsx";
import { useTheme } from "../../../../contexts/ThemeContext.jsx";
import leftimag from "../../../../assets/Logo/profile.jpg";
import { useNavigate } from "react-router-dom";

export default function UserProfile({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");
  const { authData, logout } = useAuth(); // Add logout here
  const { theme } = useTheme();
  const token = authData?.accessToken;

  const isDark = theme === 'dark';

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const styles = {
    container: {
      maxWidth: '100%',
      margin: '0 auto',
      padding: windowWidth <= 768 ? '1rem' : '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: isDark ? 'var(--bg-secondary)' : '#f8fafc',
      color: isDark ? 'var(--text-primary)' : '#1a202c',
      minHeight: '100vh'
    },
    header: {
      display: windowWidth <= 480 ? 'block' : 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: `2px solid ${isDark ? 'var(--border-color)' : '#e2e8f0'}`
    },
    title: {
      fontSize: windowWidth <= 480 ? '1.5rem' : '2rem',
      fontWeight: '700',
      color: isDark ? 'var(--text-primary)' : '#1a202c',
      margin: 0,
      marginBottom: windowWidth <= 480 ? '1rem' : 0
    },
    editButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      width: windowWidth <= 480 ? '100%' : 'auto',
      marginTop: windowWidth <= 480 ? '0.5rem' : 0,
      padding: '0.75rem 1.5rem',
      backgroundColor: isDark ? 'var(--accent)' : '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      boxShadow: isDark ? '0 2px 4px rgba(64, 169, 255, 0.2)' : '0 2px 4px rgba(79, 70, 229, 0.2)'
    },
    profileCard: {
      backgroundColor: isDark ? 'var(--bg-primary)' : 'white',
      borderRadius: '1rem',
      boxShadow: isDark ? '0 4px 6px -1px var(--shadow)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem',
      overflow: 'hidden',
      border: isDark ? `1px solid var(--border-color)` : 'none'
    },
    profileLayout: {
      display: 'grid',
      gridTemplateColumns: windowWidth <= 768 ? '1fr' : '1fr',
      gap: '0',
      minHeight: '600px'
    },
    detailsSection: {
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      backgroundColor: isDark ? 'var(--bg-primary)' : 'white'
    },
    employeeInfo: {
      display: 'grid',
      gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: windowWidth <= 768 ? '1rem' : '1.5rem',
      marginBottom: '2rem',
      padding: windowWidth <= 768 ? '1rem' : '1.5rem',
      backgroundColor: isDark ? 'var(--bg-tertiary)' : '#f1f5f9',
      borderRadius: '0.75rem',
      border: `1px solid ${isDark ? 'var(--border-color)' : '#e2e8f0'}`
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      minWidth: '0'
    },
    infoLabel: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: isDark ? 'var(--text-secondary)' : '#475569',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center'
    },
    infoValue: {
      fontSize: '1rem',
      fontWeight: '500',
      color: isDark ? 'var(--text-primary)' : '#1e293b',
      wordBreak: 'break-word',
      lineHeight: '1.4'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
      gap: '1rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: isDark ? 'var(--text-primary)' : '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: `2px solid ${isDark ? 'var(--border-color)' : '#e5e7eb'}`,
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      backgroundColor: isDark 
        ? (isEditing ? 'var(--bg-secondary)' : 'var(--bg-tertiary)') 
        : (isEditing ? '#f9fafb' : '#f1f5f9'),
      color: isDark ? 'var(--text-primary)' : '#1e293b',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: isDark ? 'var(--accent)' : '#4f46e5',
      backgroundColor: isDark ? 'var(--bg-primary)' : 'white',
      outline: 'none',
      boxShadow: isDark 
        ? '0 0 0 3px rgba(64, 169, 255, 0.1)' 
        : '0 0 0 3px rgba(79, 70, 229, 0.1)'
    },
    passwordContainer: {
      position: 'relative'
    },
    passwordToggle: {
      position: 'absolute',
      right: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: isDark ? 'var(--text-secondary)' : '#6b7280',
      padding: '0.25rem'
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: `2px solid ${isDark ? 'var(--border-color)' : '#e5e7eb'}`,
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      backgroundColor: isDark 
        ? (isEditing ? 'var(--bg-secondary)' : 'var(--bg-tertiary)') 
        : (isEditing ? '#f9fafb' : '#f1f5f9'),
      color: isDark ? 'var(--text-primary)' : '#1e293b',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    genderGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '0.5rem'
    },
    genderOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      transition: 'background-color 0.2s ease',
      color: isDark ? 'var(--text-primary)' : '#1e293b'
    },
    radioInput: {
      width: '1rem',
      height: '1rem',
      accentColor: isDark ? 'var(--accent)' : '#4f46e5'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: `2px solid ${isDark ? 'var(--border-color)' : '#e5e7eb'}`,
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      backgroundColor: isDark 
        ? (isEditing ? 'var(--bg-secondary)' : 'var(--bg-tertiary)') 
        : (isEditing ? '#f9fafb' : '#f1f5f9'),
      color: isDark ? 'var(--text-primary)' : '#1e293b',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      resize: 'vertical',
      minHeight: '60px'
    },
    passwordChangeButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      width: '100%',
      maxWidth: '300px',
      margin: '2rem auto 0 auto',
      padding: '0.75rem 1.5rem',
      backgroundColor: isDark ? 'var(--success)' : '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      boxShadow: isDark 
        ? '0 2px 4px rgba(115, 209, 61, 0.2)' 
        : '0 2px 4px rgba(5, 150, 105, 0.2)'
    },
    errorText: {
      color: isDark ? 'var(--error)' : '#dc2626',
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    }
  };

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

  const handlePasswordChange = (value) => {
    if (isEditing) {
      const error = validatePassword(value);
      setPasswordError(error);
      setPasswordUpdated(true);
      handleInputChange("password", value);
    }
  };

  const isSaveDisabled = isEditing && (phoneError || heightError || weightError);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
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
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          alert("User data updated successfully!");
          fetchUserData();
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

  const navigate = useNavigate();

  if (!userData) {
    return <div style={{ color: isDark ? 'var(--text-primary)' : '#1a202c' }}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{userData?.name || 'User'} Profile</h1>
        <button 
          style={styles.editButton}
          onClick={handleEditToggle}
          disabled={isSaveDisabled}
          onMouseEnter={e => e.target.style.backgroundColor = isDark ? '#2563eb' : '#4338ca'}
          onMouseLeave={e => e.target.style.backgroundColor = isDark ? 'var(--accent)' : '#4f46e5'}
        >
          <Edit3 size={16} />
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div style={styles.profileCard}>
        <div style={styles.profileLayout}>
          <div style={styles.detailsSection}>
            <div style={styles.employeeInfo}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>
                  <IdCard size={16} style={{ marginRight: '0.5rem' }} />
                  Employee ID
                </span>
                <span style={styles.infoValue}>{userData.id}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>
                  <Mail size={16} style={{ marginRight: '0.5rem' }} />
                  Email
                </span>
                <span style={styles.infoValue}>{userData.email}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>
                  <Briefcase size={16} style={{ marginRight: '0.5rem' }} />
                  Job Role
                </span>
                <span style={styles.infoValue}>{userData.role}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>
                  <Fingerprint size={16} style={{ marginRight: '0.5rem' }} />
                  Fingerprint Passkey
                </span>
                <span style={styles.infoValue}>{userData.passkey || 'Not set'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>
                  <UserPlus size={16} style={{ marginRight: '0.5rem' }} />
                  Join Date
                </span>
                <span style={styles.infoValue}>{userData.createdAt?.split("T")[0]}</span>
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={styles.input}
                  disabled={!isEditing}
                  onFocus={(e) => isEditing && Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? 'var(--border-color)' : '#e5e7eb';
                    e.target.style.backgroundColor = isDark 
                      ? (isEditing ? 'var(--bg-secondary)' : 'var(--bg-tertiary)') 
                      : (isEditing ? '#f9fafb' : '#f1f5f9');
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Phone size={16} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={userData.telephone || ''}
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
                  style={styles.input}
                  disabled={!isEditing}
                  maxLength={10}
                  onFocus={(e) => isEditing && Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? 'var(--border-color)' : '#e5e7eb';
                    e.target.style.backgroundColor = isDark 
                      ? (isEditing ? 'var(--bg-secondary)' : 'var(--bg-tertiary)') 
                      : (isEditing ? '#f9fafb' : '#f1f5f9');
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {phoneError && <p style={styles.errorText}>{phoneError}</p>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Calendar size={16} />
                  Birthday
                </label>
                <input
                  type="date"
                  value={userData.dob || ''}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  style={styles.input}
                  disabled={!isEditing}
                  onFocus={(e) => isEditing && Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? 'var(--border-color)' : '#e5e7eb';
                    e.target.style.backgroundColor = isDark 
                      ? (isEditing ? 'var(--bg-secondary)' : 'var(--bg-tertiary)') 
                      : (isEditing ? '#f9fafb' : '#f1f5f9');
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Preferred Language
                </label>
                <select
                  value={userData.language || ''}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  style={styles.select}
                  disabled={!isEditing}
                  onFocus={(e) => isEditing && Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? 'var(--border-color)' : '#e5e7eb';
                    e.target.style.backgroundColor = isDark 
                      ? (isEditing ? 'var(--bg-secondary)' : 'var(--bg-tertiary)') 
                      : (isEditing ? '#f9fafb' : '#f1f5f9');
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Sinhala">Sinhala</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Ruler size={16} />
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={userData.height || ''}
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
                  style={styles.input}
                  disabled={!isEditing}
                  placeholder="Enter height in cm"
                  onFocus={(e) => isEditing && Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? 'var(--border-color)' : '#e5e7eb';
                    e.target.style.backgroundColor = isDark 
                      ? (isEditing ? 'var(--bg-secondary)' : 'var(--bg-tertiary)') 
                      : (isEditing ? '#f9fafb' : '#f1f5f9');
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {heightError && <p style={styles.errorText}>{heightError}</p>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Weight size={16} />
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={userData.weight || ''}
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
                  style={styles.input}
                  disabled={!isEditing}
                  placeholder="Enter weight in kg"
                  onFocus={(e) => isEditing && Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? 'var(--border-color)' : '#e5e7eb';
                    e.target.style.backgroundColor = isDark 
                      ? (isEditing ? 'var(--bg-secondary)' : 'var(--bg-tertiary)') 
                      : (isEditing ? '#f9fafb' : '#f1f5f9');
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {weightError && <p style={styles.errorText}>{weightError}</p>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Gender</label>
                <div style={styles.genderGroup}>
                  {['male', 'female', 'other'].map(gender => (
                    <label 
                      key={gender}
                      style={styles.genderOption}
                      onMouseEnter={e => e.target.style.backgroundColor = isDark ? 'var(--bg-tertiary)' : '#f3f4f6'}
                      onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={userData.gender === gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        style={styles.radioInput}
                        disabled={!isEditing}
                      />
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <MapPin size={16} />
                  Address
                </label>
                <textarea
                  value={userData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  style={styles.textarea}
                  disabled={!isEditing}
                  onFocus={(e) => isEditing && Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? 'var(--border-color)' : '#e5e7eb';
                    e.target.style.backgroundColor = isDark 
                      ? (isEditing ? 'var(--bg-secondary)' : 'var(--bg-tertiary)') 
                      : (isEditing ? '#f9fafb' : '#f1f5f9');
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {isEditing && (
              <button 
                style={styles.passwordChangeButton}
                onClick={async () => {
                  try {
                    await logout(); // Wait for logout to complete
                    navigate('/forgotpassword');
                  } catch (error) {
                    console.error('Logout failed:', error);
                    navigate('/forgotpassword'); // Navigate anyway
                  }
                }}
                onMouseEnter={e => e.target.style.backgroundColor = isDark ? '#16a34a' : '#047857'}
                onMouseLeave={e => e.target.style.backgroundColor = isDark ? 'var(--success)' : '#059669'}
              >
                <Edit3 size={16} />
                Go to Password Change
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}