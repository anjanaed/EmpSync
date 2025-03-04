import React from "react";
import { Form, Input, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./LoginRole.module.css";
import illustration from "../../assets/illustration2.png";
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Space } from 'antd';

const LoginPage = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/reg"); 
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
          <div className={styles.logindetails}>             
              <div className={styles.loginavatar}>
                 <Avatar size={55} icon={<UserOutlined />} />
              </div>
              <div className={styles.loginname}>
                <p className={styles.username}>Mr.John Doe</p>
                <p className={styles.userpost}>HR Manager</p>
              </div>
          </div>
          <p className={styles.loginSubtitle}>Please Enter Your Credentials.</p>
          <button type="submit" className={styles.loginButton} onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;