import React, { useState } from "react";
import { Form, Input, Checkbox, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import illustration from "../../../assets/illustration.png";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import Loading from "../../atoms/loading/loading";

const redirectRoles = [
  "KITCHEN_ADMIN",
  "KITCHEN_STAFF",
  "INVENTORY_ADMIN",
  "HR_ADMIN",
];

const LoginPage = () => {
  const { login } = useAuth();
  const [loading,setLoading]=useState(false)
  const urL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate("/ServingStaff");
  };

  const handleLogin = async (username, password) => {
    setLoading(true)
    try {
      const response = await axios.post(`${urL}/auth/login`, {
        username,
        password,
      });

      const { access_token, id_token } = response.data;
      login({ access_token, id_token });


      navigate("/loginrole")

    } catch (error) {
      console.error("Login error:", error);
      message.error(`Login Failed: ${error.response.data.message}`);
    }
    setLoading(false)
  };

  if(loading){
    return <Loading/>
  }



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
