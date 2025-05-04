import React, { useState } from "react";
import { Menu, Avatar, Button, Layout } from "antd";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  CoffeeOutlined,
  BulbOutlined,
  MenuOutlined,
  CloseOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useSidebar } from "./sidebar-provider";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./Sidebar.module.css"; // Import the CSS module

const { Sider } = Layout;

export function Sidebar({ isOpen, activeTab, setActiveTab }) {
  const { toggleSidebar } = useSidebar();
  const { authData, logout } = useAuth();

  const navItems = [
    { name: "Profile", path: "/profile", icon: <UserOutlined /> },
    { name: "Payroll", path: "/payroll", icon: <DollarOutlined /> },
    { name: "Attendance", path: "/attendance", icon: <CalendarOutlined /> },
    { name: "Meals", path: "/meals", icon: <CoffeeOutlined /> },
    { name: "AI Suggestions", path: "/suggestions", icon: <BulbOutlined /> },
  ];

  return (
    <Sider
      collapsible
      collapsed={!isOpen}
      onCollapse={toggleSidebar}
      width={240}
      className={styles.sider}
      trigger={
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={logout}
          style={{ width: "100%", color: "#fff" }}
        >
          Log Out
        </Button>
      }
    >
      <div className={styles.header}>
        {isOpen && (
          <div className={styles.headerContent}>
            <Avatar size="large" src="/placeholder.svg" alt="Employee" />
            <div>
              <span className={styles.portalName}>EMS Portal</span>
              <br />
              <span className={styles.portalSubtitle}>Employee Portal</span>
            </div>
          </div>
        )}
        <Button
          type="text"
          icon={isOpen ? <CloseOutlined /> : <MenuOutlined />}
          onClick={toggleSidebar}
          style={{ marginLeft: "auto" }}
        />
      </div>

      <Menu
        mode="inline"
        selectedKeys={[activeTab]}
        className={styles.menu}
      >
        {navItems.map((item) => (
          <Menu.Item
            key={item.path.substring(1)}
            icon={item.icon}
            onClick={() => setActiveTab(item.path.substring(1))}
          >
            <Link to={item.path}>{isOpen ? item.name : null}</Link>
          </Menu.Item>
        ))}
      </Menu>

      <div className={styles.footer}>
        {isOpen ? (
          <div className={styles.footerContent}>
            <Avatar size="small" src="/placeholder.svg" alt="John Doe" />
            <div>
              <p className={styles.footerName}>
                {authData?.user?.name || "John Doe"}
              </p>
              <p className={styles.footerId}>
                ID: {authData?.user?.id || "EMP-1234"}
              </p>
            </div>
          </div>
        ) : (
          <Avatar
            size="small"
            src="/placeholder.svg"
            alt="John Doe"
            style={{ margin: "0 auto" }}
          />
        )}
      </div>
    </Sider>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState("profile");
  const { isSidebarOpen } = useSidebar();

  return (
    <Sidebar
      isOpen={isSidebarOpen}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
}