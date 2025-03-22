import React from "react";
import { Form, Input, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import styles from "./Login.module.css";
import illustration from "../../assets/illustration.png";
import Loginbutton from "../../components/atoms/button/Loginbutton/Loginbutton"; // Import the Loginbutton component

const LoginPage = () => {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate("/PasswordReset"); // Navigate to the PasswordReset page
  };

  const handleLogin = async (values) => {
    try {
      await loginWithRedirect({
        redirectUri: window.location.origin,
        appState: { targetUrl: "/LoginRole" },
        login_hint: values.employeeEmail,
      });
    } catch (error) {
      console.error("Login failed", error);
    }
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
          
          <Form layout="vertical" className={styles.loginForm} onFinish={handleLogin}>
            <Form.Item label="Employee Email" name="employeeEmail" rules={[{ required: true, message: 'Please input your Employee Email!' }]}> 
              <Input placeholder="Enter Employee Email" />
            </Form.Item>
            
            <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}> 
              <Input.Password placeholder="**********" />
            </Form.Item>
            
            <div className={styles.loginOptions}>
              <Checkbox>Remember me</Checkbox>
              <a href="#" className={styles.forgotPassword} onClick={handleForgotPassword}>Forgot Password</a>
            </div>
            
            <Form.Item>
              <Loginbutton /> {/* Replace the existing button with the Loginbutton component */}
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;