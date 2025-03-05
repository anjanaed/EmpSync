import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginRole.module.css";
import illustration from "../../assets/illustration2.png";
import { UserOutlined } from '@ant-design/icons';
import { Radio, Avatar } from "antd";

const LoginPage = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState(null);

  const handleChange = (e) => {
    setValue(e.target.value);
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
                <p className={styles.userpost}>HR Manager</p>
              </div>
          </div>
          <p className={styles.loginSubtitle}>Login As: </p>
          <hr className={styles.divider} />
          <Radio.Group value={value} onChange={handleChange} className={styles.radioGroup}>
              <Radio.Button value="employee" className={styles.customRadio}>
                Employee
              </Radio.Button>
              <Radio.Button value="inventory_manager" className={styles.customRadio}>
                Inventory Manager
              </Radio.Button>
          </Radio.Group>
          <button type="submit" className={styles.loginButton} onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;