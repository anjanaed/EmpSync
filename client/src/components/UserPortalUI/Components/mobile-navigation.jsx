import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserOutlined, DollarOutlined, CalendarOutlined, CoffeeOutlined, BulbOutlined, CloseOutlined } from "@ant-design/icons";
import { Menu, Button } from "antd";

export function MobileNavigation({ activeTab }) {
  const [isVisible, setIsVisible] = useState(true); // State to control visibility

  const navItems = [
    { name: "Profile", path: "/profile", icon: <UserOutlined /> },
    { name: "Payroll", path: "/userpayroll", icon: <DollarOutlined /> },
    { name: "Attendance", path: "/attendance", icon: <CalendarOutlined /> },
    { name: "Meals", path: "/meals", icon: <CoffeeOutlined /> },
    { name: "AI suggestions", path: "/suggestions", icon: <BulbOutlined /> },
  ];

  if (!isVisible) return null; // Hide the navigation bar if not visible

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%", // Full width for mobile
        background: "#fff",
        borderBottom: "1px solid #ddd",
        zIndex: 50,
      }}
    >
      {/* Header Section with Logo and Close Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between", // Space between logo and close button
          alignItems: "center",
          padding: "10px 15px",
          borderBottom: "1px solid #ddd",
        }}
      >
        {/* Company Logo/Text */}
        <div style={{ fontWeight: "bold", fontSize: "16px", color: "#333" }}>
          HELIX COMPANY
        </div>

        {/* Close Button */}
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => setIsVisible(false)} // Hide the navigation bar
        />
      </div>

      {/* Navigation Menu */}
      <Menu
        mode="vertical"
        selectedKeys={[activeTab]}
        style={{
          display: "flex",
          flexDirection: "column", // Ensure items stack vertically
          padding: "10px 0", // Add some padding for better spacing
        }}
      >
        {navItems.map((item) => (
          <Menu.Item key={item.path.substring(1)} icon={item.icon}>
            <Link to={item.path}>{item.name}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
}