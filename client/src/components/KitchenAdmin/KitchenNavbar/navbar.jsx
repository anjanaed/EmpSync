import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css"; // Import CSS module

const Navbar = () => {
  const location = useLocation(); // Get current path

  return (
    <nav className={styles.navbar}>
      {/* Left Side: Button Group */}
      <div className={styles.buttonGroup}>
        <Link
          to="/kitchen-admin"
          className={`${styles.navButton} ${location.pathname === "/kitchen-admin" ? styles.active : styles.defaultActive}`}
        >
          Schedule
        </Link>
        <Link
          to="/report"
          className={`${styles.navButton} ${location.pathname === "/report" ? styles.active : ""}`}
        >
          Reports & Analysis
        </Link>
      </div>

      {/* Right Side: Logout Button */}
      <button className={styles.logoutButton}>LOG OUT</button>
    </nav>
  );
};

export default Navbar;
