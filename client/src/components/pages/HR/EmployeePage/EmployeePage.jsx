import React from "react";
import {
  faUsers,
  faUserPlus,
  faDollarSign,
  faFingerprint,
  faCalendar,
  faChartLine,
  faBowlFood,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import NavBar from '../../../organisms/NavBar/NavBar';
import Employees from "../../../Organisms/HR/EmployeeList/Employees";
import { useAuth } from "../../../../contexts/AuthContext"; 

const EmployeePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); 

  // Get and parse authData from localStorage
  const rawAuthData = localStorage.getItem("authData");
  const parsedAuthData = rawAuthData ? JSON.parse(rawAuthData) : null;

  // Safely get permission actions
  const actions = parsedAuthData?.permissions?.actions || [];

  // Handle logout using context
  const handleLogout = () => {
    logout(); // ✅ clears context/auth
    navigate("/login");
  };

  // No access case
  if (!actions || actions.length === 0) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.5rem',
        color: '#ff4d4f',
        textAlign: 'center',
      }}>
        🚫 You do not have access to view this page.
        <Button
          type="primary"
          danger
          onClick={handleLogout}
          style={{ marginTop: '20px' }}
        >
          Logout
        </Button>
      </div>
    );
  }

  // All menu items
  const allMenuItems = [
    {
      key: "1",
      label: "Employees",
      action: "User Management",
      icon: <FontAwesomeIcon icon={faUsers} />,
      link: "/EmployeePage",
    },
    {
      key: "2",
      label: "Registration",
      action: "User Management",
      icon: <FontAwesomeIcon icon={faUserPlus} />,
      link: "/reg",
    },
    {
      key: "3",
      label: "Payrolls",
      action: "Payroll",
      icon: <FontAwesomeIcon icon={faDollarSign} />,
      link: "/payroll",
    },
    {
      key: "4",
      label: "FingerPrints",
      action: "User Management",
      icon: <FontAwesomeIcon icon={faFingerprint} />,
      link: "/FingerPrints",
    },
    {
      key: "5",
      label: "Schedule",
      action: "Meal Management",
      icon: <FontAwesomeIcon icon={faCalendar} />,
      link: "/kitchen-admin",
    },
    {
      key: "6",
      label: "Meal",
      action: "Meal Management",
      icon: <FontAwesomeIcon icon={faBowlFood} />,
      link: "/kitchen-meal",
    },
    {
      key: "7",
      label: "Reports & Analysis",
      action: "Reports",
      icon: <FontAwesomeIcon icon={faChartLine} />,
      link: "/kitchen-report",
    },
  ];

  const filteredMenuItems = allMenuItems.filter(item =>
    actions.includes(item.action)
  );

  return (
    <NavBar
      Comp={Employees}
      titleLines={["Human", "Resource", "Management"]}
      menuItems={filteredMenuItems}
    />
  );
};

export default EmployeePage;