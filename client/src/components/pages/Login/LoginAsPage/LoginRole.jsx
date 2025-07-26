import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginRole.module.css";
import illustration from "../../../../assets/Login/LoginRole.svg";
import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import { useAuth } from "../../../../contexts/AuthContext.jsx";
import Loading from "../../../atoms/loading/loading.jsx";

const roleDisplayMap = {
  HR_ADMIN: "Human Resource Admin",
  INVENTORY_ADMIN: "Inventory Admin",
  KITCHEN_STAFF: "Kitchen Staff",
  KITCHEN_ADMIN: "Kitchen Admin",
  SUPER_ADMIN: "Super Admin",
};

const redirectRoles = [
  "KITCHEN_ADMIN",
  "KITCHEN_STAFF",
  "INVENTORY_ADMIN",
  "HR_ADMIN",
  "SUPER_ADMIN",
];

const roleRouteMap = {
  HR_ADMIN: "/EmployeePage",
  INVENTORY_ADMIN: "/Ingredients",
  KITCHEN_STAFF: "/KitchenStaff",
  KITCHEN_ADMIN: "/kitchen-admin",
  SUPER_ADMIN: "/superadmin/dashboard",
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { authData, authLoading } = useAuth();

  if (authLoading) {
    return <Loading />;
  }

  const handleAdminLogin = () => {
    const userRole = authData.user.role;
    const route = roleRouteMap[userRole];

    navigate(route);
  };

  const handleEmployeeLogin = () => {
    navigate("/ProfilePage");
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginLeft}>
          <img
            src={illustration}
            alt="Illustration"
            className={styles.loginIllustration}
          />
        </div>
        <div className={styles.loginRight}>
          <h2 className={styles.loginTitle}>Welcome Back!</h2>
          <div className={styles.logindetails}>
            <div className={styles.loginavatar}>
              <Avatar
                size={65}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#8b0000", color: "#fff" }}
              />
            </div>
            <div className={styles.loginname}>
              <p className={styles.username}>{authData.user.name}</p>
              <p className={styles.userpost}>
                {roleDisplayMap[authData.user.role]}
              </p>
            </div>
          </div>
          <p className={styles.loginSubtitle}>Login as:</p>
          <hr className={styles.divider} />
          <div className={styles.buttonGroup}>
            <button className={styles.customButton} onClick={handleAdminLogin}>
              Administrator
            </button>
            <button
              className={styles.customButton}
              onClick={handleEmployeeLogin}
            >
              Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
