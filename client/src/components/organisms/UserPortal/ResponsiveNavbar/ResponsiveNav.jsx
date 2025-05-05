import React, { useState } from 'react';
import {
    faBars,
    faMoon,
    faSun,
  } from "@fortawesome/free-solid-svg-icons";
import { User, CreditCard, Utensils, Sparkles, LogOut, Menu, X, Users } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './ResponsiveNav.module.css';
import Companylogo from '../../../../assets/logo.png';

const ResponsiveNav = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle(styles.darkMode);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("User logged out");
  };

  return (
    <nav className={`${styles.navbar} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.companyName}>
        <img src={Companylogo} alt="Company Logo" className={styles.logo} />
      </div>
      <ul className={`${styles.navLinks} ${menuOpen ? styles.active : ''}`}>
        <li>
          <a href="#Profile" className={styles.navLink}>
            <User size={18} /> Profile
          </a>
        </li>
        <li>
          <a href="#Payroll" className={styles.navLink}>
            <CreditCard size={18} /> Payroll
          </a>
        </li>
        <li>
          <a href="#Meals" className={styles.navLink}>
            <Utensils size={18} /> Meals
          </a>
        </li>
        <li>
          <a href="#AI Suggestions" className={styles.navLink}>
            <Sparkles size={18} /> AI Suggestions
          </a>
        </li>
        <li className={styles.mobileLogout}>
          <a href="#Logout" onClick={handleLogout} className={styles.navLink}>
            <LogOut size={18} /> Logout
          </a>
        </li>
      </ul>
      <div className={styles.rightSection}>
        <button onClick={toggleDarkMode} className={styles.themeToggle}>
          {darkMode ? <FontAwesomeIcon icon={faMoon} size="lg" style={{ fontSize: '20px' }} /> : <FontAwesomeIcon icon={faSun} size="lg" style={{ fontSize: '20px' }} />}
        </button>
        <button onClick={toggleMenu} className={styles.menuToggle}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        <button onClick={handleLogout} className={`${styles.logoutButton} ${styles.desktopLogout}`}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default ResponsiveNav;