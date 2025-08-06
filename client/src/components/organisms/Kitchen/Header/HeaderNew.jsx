// Navbar.jsx
import React, { useEffect, useState } from "react";
import { Layout, Button, Typography, Avatar, Space, Dropdown } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import styles from "./header.module.css";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import img from "../../../../assets/Logo/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext.jsx"; // Adjust path as needed
import Loading from "../../../atoms/loading/loading.jsx"; // Adjust path as needed

const { Header } = Layout;

const roleDisplayMap = {
  HR_ADMIN: "Human Resource Manager",
  INVENTORY_ADMIN: "Inventory Manager", 
  KITCHEN_STAFF: "Kitchen Staff",
  KITCHEN_ADMIN: "Kitchen Administrator",
};

const Navbar = () => {
  const navigate = useNavigate();
  const { authData, logout, authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authData) {
      setCurrentUser(authData.user);
    }
    setLoading(false);
  }, [authData]);

  // Return early if loading
  if (authLoading || loading) {
    return <Loading />;
  }

  const onBackClick = () => {
    navigate("/kitchen-meal"); 
  };

  const handleLogOut = () => {
    logout();
    setCurrentUser(null);
    navigate("/login");
  };

  const items = [
    {
      key: "1",
      label: (
        <div className={styles.logout}>
          Logout <t /> <LogoutOutlined />
        </div>
      ),
      onClick: handleLogOut,
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

        <img className={styles.logo} src={img} alt="Logo" />

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
                  {currentUser ? currentUser.name : "User"}
                  
                  
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