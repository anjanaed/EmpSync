import React from "react";
import { Form, Input, Checkbox, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import illustration from "../../../assets/illustration.png";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate("/PasswordReset");
  };

  const handleLogin = async (identifier, password) => {
    let email = identifier;

    // Check if the identifier is an email or employee ID
    const isEmail = /\S+@\S+\.\S+/.test(identifier);
    if (!isEmail) {
      try {
        // Resolve email from employee ID
        const resolveResponse = await axios.get(`/resolve-email?employeeID=${identifier}`);
        email = resolveResponse.data.email;

        if (!email) {
          message.error("No email found for the given Employee ID.");
          return;
        }
      } catch (err) {
        console.error("Failed to resolve email:", err);
        message.error("Invalid Employee ID.");
        return;
      }
    }

    try {
      // Log the email and password before making the request
      console.log("Attempting login with:", { email, password });

      // Authenticate with email and password
      const response = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });

      const { access_token, id_token } = response.data;

      // Store tokens
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("id_token", id_token);

      // Decode ID token to get roles
      const decoded = jwtDecode(id_token);
      const roles = decoded["https://Gangulel.com/claims/roles"] || [];

      console.log("User Roles:", roles);

      // Navigate based on roles
      if (roles.includes("HR_Manager")) {
        navigate("/");
      } else if (roles.includes("Inventory_Manager")) {
        navigate("/inventory");
      } else if (roles.includes("Kitchen_Staff")) {
        navigate("/kitchen-staff");
      } else if (roles.includes("Kitchen_Admin")) {
        navigate("/kitchen-admin");
      } else {
        navigate("/profile"); // Fallback for 'Other' or unrecognized roles
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
            onFinish={(values) => handleLogin(values.identifier, values.password)}
          >
            <Form.Item
              label="Email or Employee ID"
              name="identifier"
              rules={[{ required: true, message: "Please input your Email or Employee ID!" }]}
            >
              <Input placeholder="Enter Email or Employee ID" />
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
              <a
                href="#"
                className={styles.forgotPassword}
                onClick={handleForgotPassword}
              >
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