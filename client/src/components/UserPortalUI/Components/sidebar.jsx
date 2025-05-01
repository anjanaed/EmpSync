import React, { useEffect, useState } from "react";
import { Avatar, Button, Menu, message } from "antd";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  CoffeeOutlined,
  BulbOutlined,
  CloseOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";

// Mock implementation of useSidebar (replace with your actual implementation)
const useSidebar = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);
  return { isOpen, toggleSidebar };
};

export function Sidebar({ isOpen, activeTab, setActiveTab }) {
  const { toggleSidebar } = useSidebar();
  const location = useLocation();

  // Retrieve employeeId from location.state or localStorage
  const [employeeId, setEmployeeId] = useState(() => {
    const idFromState = location.state?.employeeId?.toUpperCase();
    const idFromStorage = localStorage.getItem("employeeId");
    return idFromState || idFromStorage || "Loading...";
  });

  const [employeeName, setEmployeeName] = useState("Loading...");

  useEffect(() => {
    // Save employeeId to localStorage if it's available
    if (employeeId && employeeId !== "Loading...") {
      localStorage.setItem("employeeId", employeeId);
    }

    // Fetch employee name from the database
    if (employeeId && employeeId !== "Loading...") {
      axios
        .get(`http://localhost:3000/user/${employeeId}`) // Replace with your actual API endpoint
        .then((response) => {
          setEmployeeName(response.data.name || "Unknown User");
        })
        .catch((error) => {
          console.error("Failed to fetch employee name:", error);
          message.error("Failed to load employee name.");
          setEmployeeName("Error Loading Name");
        });
    }
  }, [employeeId]);

  const navItems = [
    { name: "Profile", path: "/profile", icon: <UserOutlined /> },
    { name: "Payroll", path: "/userpayroll", icon: <DollarOutlined /> },
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
            onClick={() => setActiveTab && setActiveTab(item.path.substring(1))}
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
            <Avatar size="small" src="/placeholder.svg" alt={employeeName || "User"} />
            <div>
              <p style={{ margin: 0, fontWeight: "bold" }}>
                {employeeName}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#8c8c8c" }}>
                ID: {employeeId || "Loading..."}
              </p>
            </div>
          </div>
        ) : (
          <Avatar
            size="small"
            src="/placeholder.svg"
            alt={employeeName || "User"}
            style={{ margin: "0 auto" }}
          />
        )}
      </div>
    </Sider>
  );
}