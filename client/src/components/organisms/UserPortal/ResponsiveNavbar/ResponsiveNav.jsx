import React, { useState } from 'react';
import {
    faBars,
    faMoon,
    faSun,
  } from "@fortawesome/free-solid-svg-icons";
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

  return (
    <nav className={`${styles.navbar} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.companyName}>
        <img src={Companylogo} alt="Company Logo" className={styles.logo} />
      </div>
      <ul className={`${styles.navLinks} ${menuOpen ? styles.active : ''}`}>
        <li><a href="#Profile" className={styles.navLink}>Profile</a></li>
        <li><a href="#Payroll" className={styles.navLink}>Payroll</a></li>
        <li><a href="#Meals" className={styles.navLink}>Meals</a></li>
        <li><a href="#AI Suggestions" className={styles.navLink}>AI Suggestions</a></li>
      </ul>
      <button onClick={toggleDarkMode} className={styles.themeToggle}>
        {darkMode ? <FontAwesomeIcon icon={faMoon} /> : <FontAwesomeIcon icon={faSun} />}
      </button>
      <button onClick={toggleMenu} className={styles.menuToggle}>
        <FontAwesomeIcon icon={faBars} />
      </button>
    </nav>
  );
};

export default ResponsiveNav;