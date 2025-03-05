import React from "react";
import { Form, Input, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./PasswordReset.module.css";
import illustration from "../../assets/illustration.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/LoginRole"); 
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginLeft}>
          <img
            src={illustration}
            alt="Illustration"
            className={styles.loginIllustration}
          />
        </div>
        <div className={styles.loginRight}>
          <h2 className={styles.loginTitle}>Welcome Back !</h2>
          <p className={styles.loginSubtitle}>Please Enter Your Credentials.</p>
          
        </div>
      </div>
    </div>
  );
};

export default LoginPage;