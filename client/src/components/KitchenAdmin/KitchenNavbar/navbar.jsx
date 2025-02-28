import React from "react";
import { Link, useLocation,useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css"; // Import CSS module

const Navbar = () => {
  const location = useLocation(); // Get current path
  const navigate=useNavigate();

  return (
    <nav className={styles.navbar}>
      {/* Left Side: Button Group */}
      <div className={styles.buttonGroup}>
        <button
          onClick={() => navigate("/kitchen-admin")}
          className={`${styles.navButton} ${location.pathname === "/kitchen-admin" ? styles.active : styles.defaultActive}`}
        >
          Schedule
        </button>
        <button
          onClick={()=>navigate("/report")}
          className={`${styles.navButton} ${location.pathname === "/report" ? styles.active : ""}`}
        >
          Reports & Analysis
        </button>
      </div>

      {/* Right Side: Logout Button */}
      <button onClick={()=>navigate("/login")} className={styles.logoutButton}>Logout</button>
    </nav>
  );
};

export default Navbar;
