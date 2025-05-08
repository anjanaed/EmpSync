import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../../../../contexts/AuthContext'; // Import useAuth
import {
  faBars,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { User, CreditCard, Utensils, Sparkles, LogOut } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './ResponsiveNav.module.css';
import Companylogo from '../../../../assets/Logo/logo.png';
import Whitelogo from '../../../../assets/Logo/Logowhite.png';

const ResponsiveNav = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate
  const { logout } = useAuth(); // Get the logout function from useAuth

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle(styles.darkMode);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logout(); // Call the logout function to clear user data
    console.log("User logged out");
    navigate('/login'); // Redirect to the login page
  };

  return (
    <nav className={`${styles.navbar} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.companyName}>
        <img
          src={darkMode ? Whitelogo : Companylogo}
          alt="Company Logo"
          className={styles.logo}
        />
      </div>
      <ul className={`${styles.navLinks} ${menuOpen ? styles.active : ''}`}>
        <li>
          <a href="/ProfilePage" className={styles.navLink}>
            <User size={18} /> Profile
          </a>
        </li>
        <li>
          <a href="#Payroll" className={styles.navLink}>
            <CreditCard size={18} /> Payroll
          </a>
        </li>
        <li>
          <a href="/UserMeals" className={styles.navLink}>
            <Utensils size={18} /> Meals
          </a>
        </li>
        <li>
          <a href="#personalized Suggestions" className={styles.navLink}>
            <Sparkles size={18} /> personalized Suggestions
          </a>
        </li>
        <li className={styles.mobileLogout}>
          <a href="#Logout" onClick={handleLogout} className={styles.navLink}>
            <LogOut size={18} /> Logout
          </a>
        </li>
      </ul>
      <div className={styles.rightSection}>
        <button
          onClick={toggleDarkMode}
          className={styles.themeToggle}
          aria-label="Toggle Dark Mode"
        >
          <FontAwesomeIcon
            icon={darkMode ? faSun : faMoon}
            size="lg"
            style={{ fontSize: '20px' }}
          />
        </button>
        <button
          onClick={toggleMenu}
          className={styles.menuToggle}
          aria-label="Toggle Menu"
        >
          <FontAwesomeIcon icon={faBars} size="lg" style={{ fontSize: '20px' }} />
        </button>
        <button
          onClick={handleLogout}
          className={`${styles.logoutButton} ${styles.desktopLogout}`}
          style={{ fontSize: '16px' }} // Adjust the font size here
        >
          <LogOut size={18} style={{ marginRight: '8px' }} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default ResponsiveNav;