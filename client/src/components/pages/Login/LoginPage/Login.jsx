import React, { useState } from "react";
import { Form, Input, Checkbox, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import illustration from "../../../../assets/Login/Loginpage.png";
import axios from "axios";
import { useAuth } from "../../../../contexts/AuthContext.jsx";
import Loading from "../../../atoms/loading/loading.jsx";


const LoginPage = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const urL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate("/PasswordReset");
  };

  const handleLogin = async (username, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${urL}/auth/login`, {
        username,
        password,
      });

      const { access_token, id_token } = response.data;
      await login({ access_token, id_token });
      navigate("/loginrole");
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please try again.";
      message.error(`Login Failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
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
          <p className={styles.loginSubtitle}>Please Enter Your Information.</p>

          <Form
            layout="vertical"
            className={styles.loginForm}
            onFinish={(values) =>
              handleLogin(values.employeeID, values.password)
            }
          >
            <Form.Item
              label="Employee ID / Email"
              name="employeeID"
              rules={[
                { required: true, message: "Please Input Your Employee ID !" },
              ]}
            >
              <Input placeholder="Enter Employee ID Or Email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please Input Your Password !" },
              ]}
            >
              <Input.Password placeholder="**********" />
            </Form.Item>

            <div className={styles.loginOptions}>
              {/* <Checkbox>Remember me</Checkbox> */}
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
