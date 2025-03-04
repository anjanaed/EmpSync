import React from "react";
import { Form, Input, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import illustration from "../../assets/illustration.png";

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
          <p className={styles.loginSubtitle}>Please Enter Your Credentials.</p>
          
          <Form layout="vertical" className={styles.loginForm}>
            <Form.Item label="Employee ID" name="employeeID" rules={[{ required: true, message: 'Please input your Employee ID!' }]}> 
              <Input placeholder="Enter Employee ID" />
            </Form.Item>
            
            <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}> 
              <Input.Password placeholder="**********" />
            </Form.Item>
            
            <div className={styles.loginOptions}>
              <Checkbox>Remember me</Checkbox>
              <a href="#" className={styles.forgotPassword}>Forgot Password</a>
            </div>
            
            <Form.Item>
              <button type="submit" className={styles.loginButton} onClick={handleLogin}>Login</button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;