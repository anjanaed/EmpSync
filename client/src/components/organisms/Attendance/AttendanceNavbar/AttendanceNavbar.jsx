import React, { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { Menu, DatePicker } from "antd"; // Import DatePicker from Ant Design
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [selectedKey, setSelectedKey] = useState("");
  const navigate = useNavigate();

  const checkPath = () => {
    const path = location.pathname;
    if (path === "/overview") {
      setSelectedKey("1");
    }
    if (path === "/employee-details") {
      setSelectedKey("2");
    }
    if (path === "/reports") {
      setSelectedKey("3");
    }
  };

  useEffect(() => {
    checkPath();
  }, [location.pathname]);

  const handleDateChange = (date, dateString) => {
    console.log("Selected Date:", dateString); // Handle the selected date
  };

  return (
    <div className={styles.navbar}>
      <Menu
        mode="horizontal" // Set the menu to horizontal mode
        selectedKeys={[selectedKey]}
        className={styles.menu}
        items={[
          {
            key: "1",
            label: "Overview",
            onClick: () => navigate("/Attendance"),
          },
          {
            key: "2",
            label: "Employee Details",
            onClick: () => navigate("/EmployeeDetails"),
          },
          {
            key: "3",
            label: "Reports",
            onClick: () => navigate("/reports"),
          },
        ]}
      />
      <div className={styles.datePickerContainer}>
        <DatePicker onChange={handleDateChange} className={styles.datePicker} />
      </div>
    </div>
  );
};

export default Navbar;