import React, { useState } from "react";
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
import styles from "./ChangePassword.module.css";
import illustration from "../../../assets/Login/Password-Reset.png";
import axios from "axios";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { authData } = useAuth();
  const [email, setEmail] = useState(authData?.user?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const auth0Url = import.meta.env.VITE_AUTH0_URL;
  const auth0Id = import.meta.env.VITE_AUTH0_ID;

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
    navigate(-1); // Go back to previous page
  };

  return (
    <div className={styles.changePasswordContainer}>
      <div className={styles.changePasswordBox}>
        <div className={styles.changePasswordLeft}>
          <img
            src={illustration}
            alt="Illustration"
            className={styles.changePasswordIllustration}
          />
        </div>
        <div className={styles.changePasswordRight}>
          <div className={styles.container}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.title}>Change Password</div>
                <div className={styles.description}>
                  We'll send you a secure link to reset your password to your registered email address.
                </div>
              </div>
              <div className={styles.cardContent}>
                {isSuccess ? (
                  <Alert
                    message="Password Reset Link Sent Successfully!"
                    description="Please check your email and follow the instructions to reset your password."
                    type="success"
                    showIcon
                    icon={
                      <CheckCircleOutlined className={styles.successIcon} />
                    }
                  />
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className={styles.formContent}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={!!authData?.user?.email} // Disable if user email is available
                        />
                      </div>
                      {error && (
                        <Alert
                          message="Error"
                          description={error}
                          type="error"
                          showIcon
                          icon={
                            <ExclamationCircleOutlined
                              className={styles.errorIcon}
                            />
                          }
                        />
                      )}
                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting || !email}
                      >
                        {isSubmitting ? (
                          <>
                            <LoadingOutlined className={styles.loadingIcon} />
                            Sending Reset Link
                          </>
                        ) : (
                          <>
                            Send Password Reset Link
                            <ArrowRightOutlined className={styles.arrowIcon} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
              <div className={styles.footer}>
                <button 
                  onClick={handleGoBack}
                  className={styles.backButton}
                >
                  <ArrowLeftOutlined className={styles.backIcon} />
                  Back to Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
