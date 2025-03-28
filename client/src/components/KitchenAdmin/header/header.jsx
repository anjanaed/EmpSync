// Navbar.jsx
import React from 'react';
import { Layout, Button, Typography } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import styles from './header.module.css';

const { Header } = Layout;
const { Title } = Typography;

const Navbar = ({ title, onBackClick, showLogout = true }) => {
  return (
    <Header className={styles.header}>
      <div className={styles.navbarContent}>
        <Button 
          type="text" 
          icon={<LeftOutlined />} 
          onClick={onBackClick}
          className={styles.backButton}
        />
        
        <Title level={4} className={styles.title}>
          {title}
        </Title>
        
        {showLogout && (
          <Button 
            type="primary" 
            danger
            className={styles.logoutButton}
          >
            Log Out
          </Button>
        )}
      </div>
    </Header>
  );
};

export default Navbar;