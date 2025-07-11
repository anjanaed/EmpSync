import React, { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../../contexts/AuthContext";
import Loading from "../../../../atoms/loading/loading";
import styles from "./Login.module.css";

const SuperAdminLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const urL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleLogin = async (username, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${urL}/superadmin/login`, {
        username,
        password,
      });

      const { access_token, id_token } = response.data;
      await login({ access_token, id_token });
      
      message.success("Login successful!");
      navigate("/superadmin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      message.error(`Login Failed: ${error.response?.data?.message || "Invalid credentials"}`);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = (values) => {
    handleLogin(values.username, values.password);
  };

  if (loading) {
    return <Loading text="Signing in..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginWrapper}>
        <Card className={styles.loginCard}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>Super Admin</h1>
              <p className={styles.subtitle}>Sign in to continue</p>
            </div>
          </div>

          <Form
            form={form}
            name="superadmin_login"
            className={styles.loginForm}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              label={<span className={styles.label}>Username</span>}
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className={styles.inputIcon} />}
                placeholder="Enter your username"
                className={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className={styles.label}>Password</span>}
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className={styles.inputIcon} />}
                placeholder="Enter your password"
                className={styles.input}
              />
            </Form.Item>

            <Form.Item className={styles.submitContainer}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className={styles.loginButton}
                icon={<LoginOutlined />}
                block
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Secure access for system administrators
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminLogin;