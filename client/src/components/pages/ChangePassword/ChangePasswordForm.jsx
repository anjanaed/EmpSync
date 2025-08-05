import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Alert } from "antd";
import {
  LoadingOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import { useTheme } from "../../../contexts/ThemeContext.jsx";
import axios from "axios";

const ChangePasswordForm = () => {
  const navigate = useNavigate();
  const { authData } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState(authData?.user?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const auth0Url = import.meta.env.VITE_AUTH0_URL;
  const auth0Id = import.meta.env.VITE_AUTH0_ID;

  const isDark = theme === 'dark';

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: isDark ? 'var(--bg-primary)' : 'white',
      borderRadius: '1rem',
      boxShadow: isDark ? '0 4px 6px -1px var(--shadow)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: isDark ? `1px solid var(--border-color)` : 'none',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: isDark ? 'var(--text-primary)' : '#1a202c',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: `2px solid ${isDark ? 'var(--border-color)' : '#e2e8f0'}`
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: isDark ? 'var(--text-primary)' : '#1a202c',
      marginBottom: '0.5rem'
    },
    description: {
      fontSize: '1rem',
      color: isDark ? 'var(--text-secondary)' : '#666',
      lineHeight: '1.5'
    },
    cardContent: {
      marginBottom: '2rem'
    },
    formContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '1rem',
      marginTop: '1rem'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: isDark ? 'var(--text-primary)' : '#374151',
      marginBottom: '0.5rem'
    },
    submitButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'var(--accent)' : '#4f46e5',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      boxShadow: isDark ? '0 2px 4px rgba(64, 169, 255, 0.2)' : '0 2px 4px rgba(79, 70, 229, 0.2)',
      marginTop: '1rem'
    },
    footer: {
      display: 'flex',
      justifyContent: 'center',
      borderTop: `1px solid ${isDark ? 'var(--border-color)' : '#e5e7eb'}`,
      paddingTop: '1rem'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: 'none',
      border: 'none',
      color: isDark ? 'var(--accent)' : '#007bff',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
      borderRadius: '0.375rem'
    },
    backIcon: {
      height: '1rem',
      width: '1rem'
    },
    loadingIcon: {
      marginRight: '0.5rem',
      height: '1rem',
      width: '1rem',
      animation: 'spin 1s linear infinite'
    },
    arrowIcon: {
      marginLeft: '0.5rem',
      height: '1rem',
      width: '1rem'
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post(`https://${auth0Url}/dbconnections/change_password`, {
        client_id: auth0Id,
        email: email,
        connection: "Username-Password-Authentication",
      });
      console.log(res);
      setIsSuccess(true);
    } catch (err) {
      setError("There was an error sending the reset link. Please try again.");
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Add spin animation styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Change Password</h1>
        <p style={styles.description}>
          We'll send you a secure link to reset your password to your registered email address.
        </p>
      </div>
      
      <div style={styles.cardContent}>
        {isSuccess ? (
          <Alert
            message="Password Reset Link Sent Successfully!"
            description="Please check your email and follow the instructions to reset your password."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={styles.formContent}>
              <div style={styles.inputGroup}>
                <label htmlFor="email" style={styles.label}>Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!!authData?.user?.email}
                  style={{
                    backgroundColor: isDark ? 'var(--bg-secondary)' : 'white',
                    borderColor: isDark ? 'var(--border-color)' : '#d1d5db',
                    color: isDark ? 'var(--text-primary)' : '#1f2937'
                  }}
                />
              </div>
              {error && (
                <Alert
                  message="Error"
                  description={error}
                  type="error"
                  showIcon
                  icon={<ExclamationCircleOutlined />}
                />
              )}
              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  backgroundColor: isSubmitting || !email 
                    ? (isDark ? '#374151' : '#9ca3af') 
                    : (isDark ? 'var(--accent)' : '#4f46e5')
                }}
                disabled={isSubmitting || !email}
                onMouseEnter={e => {
                  if (!isSubmitting && email) {
                    e.target.style.backgroundColor = isDark ? '#2563eb' : '#4338ca';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSubmitting && email) {
                    e.target.style.backgroundColor = isDark ? 'var(--accent)' : '#4f46e5';
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <LoadingOutlined style={styles.loadingIcon} />
                    Sending Reset Link
                  </>
                ) : (
                  <>
                    Send Password Reset Link
                    <ArrowRightOutlined style={styles.arrowIcon} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
      
      <div style={styles.footer}>
        <button 
          onClick={handleGoBack}
          style={styles.backButton}
          onMouseEnter={e => e.target.style.backgroundColor = isDark ? 'var(--bg-tertiary)' : '#f3f4f6'}
          onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
        >
          <ArrowLeftOutlined style={styles.backIcon} />
          Back to Profile
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
