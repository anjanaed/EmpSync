import React from "react";
import { Form, Input, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import illustration from "../../assets/illustration.png";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {

    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="login-box">
       
        <div className="login-left">
          <img
            src={illustration}
            alt="Illustration"
            className="login-illustration"
          />
        </div>     
        <div className="login-right">
          <h2 className="login-title">WELCOME BACK</h2>
          <p className="login-subtitle">Please enter your details.</p>
          
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
              <button type="submit" className="login-button" onClick={handleLogin}>Login</button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;