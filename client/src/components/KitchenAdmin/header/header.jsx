// Navbar.jsx
import React from 'react';
import { Layout, Button, Typography, Avatar,Space,Dropdown } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import styles from './header.module.css';
import { UserOutlined,LogoutOutlined } from "@ant-design/icons";
import img from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";




const { Header } = Layout;


const Navbar = () => {

const navigate = useNavigate();
  
  const onBackClick = () => {
    navigate("/kitchen-meal"); // Navigates to the Reports page
  };
  

const items = [
    {
      key: "1",
      label: (
        <div className={styles.logout}>
          Logout <t /> <LogoutOutlined />
        </div>
      ),
      onClick: () => navigate("/login"),
    },
  ];
  return (
    <Header className={styles.header}>
      <div className={styles.navbarContent}>
        <Button 
          type="text" 
          icon={<LeftOutlined />} 
          onClick={onBackClick}
          className={styles.backButton}
        />
        
        {/* <Title level={3} className={styles.title}>
          
        </Title> */}
        <img className={styles.logo} src={img}></img>
        
        <div className={styles.userDropdown}>
            <Space direction="vertical">
              <Space wrap>
                <Dropdown
                  menu={{
                    items,
                  }}
                  placement="bottomLeft"
                >
                  <Button className={styles.dropButton}>
                    <Avatar
                      style={{ backgroundColor: "#d10000" }}
                      size={38}
                      icon={<UserOutlined />}
                    />
                    Kitchen Admin
                  </Button>
                </Dropdown>
              </Space>
            </Space>
          </div>
      </div>
    </Header>
  );
};

export default Navbar;