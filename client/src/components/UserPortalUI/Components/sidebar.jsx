import React from "react";
import { Menu, Avatar, Button, Layout } from "antd";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
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
import { useAuth } from "../../../contexts/AuthContext"; // Import useAuth

const { Sider } = Layout;

export function Sidebar({ isOpen, activeTab, setActiveTab }) {
  const { toggleSidebar } = useSidebar();
  const { authData, logout } = useAuth(); // Access logout function from AuthContext

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
      style={{
        height: "100vh",
        backgroundColor: "#f0f2f5",
        borderRight: "1px solid #d9d9d9",
        display: "flex",
        flexDirection: "column",
      }}
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
      <div
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {isOpen && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Avatar size="large" src="/placeholder.svg" alt="Employee" />
            <div>
              <span style={{ fontWeight: "bold" }}>EMS Portal</span>
              <br />
              <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
                Employee Portal
              </span>
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
        style={{ borderRight: "none", flex: 1 }}
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

      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #d9d9d9",
        }}
      >
        {isOpen ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Avatar size="small" src="/placeholder.svg" alt="John Doe" />
            <div>
              <p style={{ margin: 0, fontWeight: "bold" }}>
                {authData?.user?.name || "John Doe"}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#8c8c8c" }}>
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