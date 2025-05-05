import React, { useState } from 'react';
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
      <button onClick={toggleMenu} className={styles.menuToggle}>
        ☰
      </button>
      <ul className={`${styles.navLinks} ${menuOpen ? styles.active : ''}`}>
        <li><a href="#meel" className={styles.navLink}>Meel</a></li>
        <li><a href="#account" className={styles.navLink}>Account</a></li>
        <li><a href="#payroll" className={styles.navLink}>Payroll</a></li>
        <li><a href="#aisuggestion" className={styles.navLink}>AI Suggestion</a></li>
      </ul>
      <button onClick={toggleDarkMode} className={styles.themeToggle}>
        {darkMode ? '🌙' : '☀️'}
      </button>
    </nav>
  );
};

export default ResponsiveNav;