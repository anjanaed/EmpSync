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
import NavBar from '../../../organisms/NavBar/NavBar';
import FingerPrints from '../../../organisms/HR/FingerPrints/FingerPrints';
import { useAuth } from "../../../../contexts/AuthContext"; 

const FingerPrintPage = () => {
  const { authData } = useAuth();
  
  // Get permission actions safely
  const actions = authData?.permissions?.actions || [];

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
      link: "/FingerPrints",
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
    <NavBar
      Comp={FingerPrints}
      titleLines={["Human", "Resource", "Management"]}
      menuItems={filteredMenuItems}
    />
  );
};

export default FingerPrintPage;
