import React from "react";
import { Link } from "react-router-dom";
import { UserOutlined, DollarOutlined, CalendarOutlined, CoffeeOutlined, BulbOutlined } from "@ant-design/icons";
import { Menu } from "antd";

export function MobileNavigation({ activeTab }) {
  const navItems = [
    { name: "Profile", path: "/profile", icon: <UserOutlined /> },
    { name: "Payroll", path: "/payroll", icon: <DollarOutlined /> },
    { name: "Attendance", path: "/attendance", icon: <CalendarOutlined /> },
    { name: "Meals", path: "/meals", icon: <CoffeeOutlined /> },
    { name: "AI", path: "/suggestions", icon: <BulbOutlined /> },
  ];

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #ddd", zIndex: 50 }}>
      <Menu mode="horizontal" selectedKeys={[activeTab]} style={{ display: "flex", justifyContent: "space-around" }}>
        {navItems.map((item) => (
          <Menu.Item key={item.path.substring(1)} icon={item.icon}>
            <Link to={item.path}>{item.name}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
}