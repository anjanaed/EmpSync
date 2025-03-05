import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginRole.module.css";
import illustration from "../../assets/illustration2.png";
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from "antd";

const LoginPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleLogin = () => {
    navigate("/reg");
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
          <div className={styles.logindetails}>
            <div className={styles.loginavatar}>
              <Avatar
                size={55}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#8b0000', color: '#fff' }}
              />
            </div>
            <div className={styles.loginname}>
              <p className={styles.username}>Mr.John Doe</p>
              <p className={styles.userpost}>Human Resources Manager.</p>
            </div>
          </div>
          <p className={styles.loginSubtitle}>Login as:</p>
          <hr className={styles.divider} />
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.customButton} ${selectedRole === 'employee' ? styles.selectedButton : ''}`}
              onClick={() => handleRoleClick('employee')}
            >
              Employee
            </button>
            <button
              className={`${styles.customButton} ${selectedRole === 'inventory_manager' ? styles.selectedButton : ''}`}
              onClick={() => handleRoleClick('inventory_manager')}
            >
              Inventory Manager
            </button>
          </div>
          <button type="submit" className={styles.loginButton} onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;