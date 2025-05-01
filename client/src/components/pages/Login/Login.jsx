import React from "react";
import { Form, Input, Checkbox, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import illustration from "../../../assets/illustration.png";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../../AuthContext";

const LoginPage = () => {
  const { login, authData } = useAuth();
  const urL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate("/PasswordReset");
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post(`${urL}/auth/login`, {
        username,
        password,
      });

   

      const { access_token, id_token } = response.data;
      login({ access_token, id_token });

      if (access_token) {
        try {
          const employeeId = authData.user.data.id;

          const response = await axios.get(
            `${urL}/user/fetchrole/${employeeId.toUpperCase()}`
          );
          const userRole = response.data;

          const roleRouteMap = {
            HR_Manager: "/",
            Inventory_Manager: "/inventory",
            Kitchen_Staff: "/kitchen-staff",
            Kitchen_Admin: "/kitchen-admin",
          };

          const route = roleRouteMap[userRole] || "/profile";

          navigate(route);
        } catch (err) {
          console.error("Failed to fetch role or navigate:", err);
        }
      } else {
        return;
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(`Login Failed: ${error.response.data.message}`);
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
            onFinish={(values) =>
              handleLogin(values.employeeID, values.password)
            }
          >
            <Form.Item
              label="Employee ID"
              name="employeeID"
              rules={[
                { required: true, message: "Please input your Employee ID!" },
              ]}
            >
              <Input placeholder="Enter Employee ID" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
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
              <Button
                type="primary"
                htmlType="submit"
                className={styles.loginButton}
              >
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
