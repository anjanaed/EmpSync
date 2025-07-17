import React from "react";
import {
  faUsers,
  faUserPlus,
  faFileInvoice,
  faDollarSign,
  faFingerprint,
  faCalendar,
  faChartLine,
  faBowlFood,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "antd";
import NavBar from '../../../organisms/NavBar/NavBar';
import Menu from "../../../organisms/Kitchen/Schedule/Calendar";
import NotificationPanel from "../../../organisms/Kitchen/NotificationPanel/NotificationPanel";
import { useNotifications } from "../../../../contexts/NotificationsContext";
import { useAuth } from "../../../../contexts/AuthContext";
import styles from "../../../organisms/Kitchen/NotificationPanel/NotificationPanel.module.css";

const AnalysisDashboard = () => {
  // Get and parse authData from localStorage
  const rawAuthData = localStorage.getItem("authData");
  const parsedAuthData = rawAuthData ? JSON.parse(rawAuthData) : null;
  const { logout } = useAuth();

  // Safely get permission actions
  const actions = parsedAuthData?.permissions?.actions || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // If no permissions, show a "No Access" message
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

  // Define all possible menu items
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
      label: "FingerPrints",
      action: "User Management",
      icon: <FontAwesomeIcon icon={faFingerprint} />,
      link: "/FingerPrint",
    },
    {
      key: "4",
      label: "Payrolls",
      action: "Payroll",
      icon: <FontAwesomeIcon icon={faDollarSign} />,
      link: "/payroll",
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

  // Filter menu based on permissions
  const filteredMenuItems = allMenuItems.filter((item) =>
    actions.includes(item.action)
  );

  return (
    <>
      <NavBar
        Comp={Menu}
        titleLines={["Meal", "Schedule", "Management"]}
        menuItems={filteredMenuItems}
      />
      <NotificationPanel />
    </>
  );
};

export default AnalysisDashboard;