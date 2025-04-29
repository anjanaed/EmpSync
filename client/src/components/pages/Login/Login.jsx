import React from "react";
import { Form, Input, Checkbox, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import illustration from "../../../assets/illustration.png";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate("/PasswordReset");
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password
      });

      const { access_token, id_token } = response.data;

      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('id_token', id_token);

      // Decode ID token to get roles
      const decoded = jwtDecode(id_token);
      const roles = decoded['https://Gangulel.com/claims/roles'] || [];

      console.log('User Roles:', roles);

      // Navigate based on roles
      if (roles.includes('HR_Manager')) {
        navigate("/");
      } else {
        navigate("/kitchen-admin");
      }

    } catch (error) {
      console.error("Login error:", error);
      message.error("Login failed. Please check your credentials.");
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
          <h2 className={styles.loginTitle}>Welcome Back!</h2>
          <p className={styles.loginSubtitle}>Please Enter Your Credentials.</p>

          <Form
            layout="vertical"
            className={styles.loginForm}
            onFinish={(values) => handleLogin(values.employeeID, values.password)}
          >
            <Form.Item
              label="Employee ID"
              name="employeeID"
              rules={[{ required: true, message: 'Please input your Employee ID!' }]}
            >
              <Input placeholder="Enter Employee ID" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
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
              <Button type="primary" htmlType="submit" className={styles.loginButton}>
                Login
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
