import React from "react";
import { Form, Input, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react"; // Import useAuth0
import styles from "./Login.module.css";
import illustration from "../../assets/illustration.png";

const LoginPage = () => {
  const { loginWithRedirect } = useAuth0(); // Destructure loginWithRedirect from useAuth0
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
      // Use loginWithRedirect to authenticate the user
      await loginWithRedirect({
        redirectUri: window.location.origin + "/LoginRole", // Redirect to LoginRole after login
      });
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleForgotPassword = () => {
    navigate("/PasswordReset"); // Navigate to the PasswordReset page
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
          
          <Form
            layout="vertical"
            className={styles.loginForm}
            onFinish={handleLogin} // Trigger handleLogin on form submission
          >
            <Form.Item
              label="Employee Email"
              name="employeeEmail"
              rules={[{ required: true, message: "Please input your Employee Email!" }]}
            >
              <Input placeholder="Enter Employee Email" />
            </Form.Item>
            
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password placeholder="**********" />
            </Form.Item>
            
            <div className={styles.loginOptions}>
              <Checkbox>Remember me</Checkbox>
              <a href="#" className={styles.forgotPassword} onClick={handleForgotPassword}>
                Forgot Password
              </a>
            </div>
            
            <Form.Item>
              <button type="submit" className={styles.loginButton}>
                Login
              </button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;