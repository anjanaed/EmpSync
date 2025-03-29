// Navbar.jsx
import React from 'react';
import { Layout, Button, Typography, Avatar,Space,Dropdown } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import styles from './header.module.css';
import { UserOutlined,LogoutOutlined } from "@ant-design/icons";



const { Header } = Layout;
const { Title } = Typography;

const Navbar = ({ title, onBackClick = true }) => {

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
        
        <Title level={4} className={styles.title}>
          {title}
        </Title>
        
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