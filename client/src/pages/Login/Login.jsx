import React from "react";
import { Form, Input, Button, Checkbox } from "antd";
import "./Login.css";

const LoginPage = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        {/* Left Section */}
        <div className="login-left">
          <img
            src="./assets/illustration.png"
            alt="Illustration"
            className="login-illustration"
          />
        </div>

        {/* Right Section */}
        <div className="login-right">
          <h2 className="login-title">WELCOME BACK</h2>
          <p className="login-subtitle">Welcome back! Please enter your details.</p>
          
          <Form layout="vertical" className="login-form">
            <Form.Item label="Employee ID" name="employeeID" rules={[{ required: true, message: 'Please input your Employee ID!' }]}> 
              <Input placeholder="Enter your Employee ID" />
            </Form.Item>
            
            <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}> 
              <Input.Password placeholder="**********" />
            </Form.Item>
            
            <div className="login-options">
              <Checkbox>Remember me</Checkbox>
              <a href="#" className="forgot-password">Forgot password</a>
            </div>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-button">
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
