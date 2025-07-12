import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import { useAuth } from '../../../../contexts/AuthContext'; // Import useAuth for authentication context
import {
  faBars,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons"; // Import FontAwesome icons for menu and theme toggle
import { User, CreditCard, Utensils, Sparkles, LogOut } from "lucide-react"; // Import Lucide icons for navigation links
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesome component
import styles from './ResponsiveNav.module.css'; // Import CSS module for styling
import Companylogo from '../../../../assets/Logo/logo.png'; // Import company logo for light mode
import Whitelogo from '../../../../assets/Logo/Logowhite.png'; // Import company logo for dark mode

// ResponsiveNav component for navigation bar
const ResponsiveNav = () => {
  // State to manage dark mode toggle
  const [darkMode, setDarkMode] = useState(false);
  // State to manage mobile menu visibility
  const [menuOpen, setMenuOpen] = useState(false);
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // Destructure logout function and authData from AuthContext
  const { logout, authData } = useAuth();

  // Toggle dark mode and apply class to body
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle(styles.darkMode);
  };

  // Toggle mobile menu visibility
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Handle logout action
  const handleLogout = () => {
    logout(); // Clear user data
    console.log("User logged out");
    navigate('/login'); // Redirect to login page
  };

  // Render navigation bar
  return (
    <nav className={`${styles.navbar} ${darkMode ? styles.dark : ''}`}>
      {/* Company logo section */}
      <div className={styles.companyName}>
        <img
          src={darkMode ? Whitelogo : Companylogo} // Switch logo based on dark mode
          alt="Company Logo"
          className={styles.logo}
        />
      </div>
      {/* Navigation links */}
      <ul className={`${styles.navLinks} ${menuOpen ? styles.active : ''}`}>
        {/* Profile link */}
        <li>
          <a href="/ProfilePage" className={styles.navLink}>
            <User size={18} /> Profile
          </a>
        </li>
        {/* Payroll link */}
        <li>
          <a href="#Payroll" className={styles.navLink}>
            <CreditCard size={18} /> Payroll
          </a>
        </li>
        {/* Meals1 link */}
        <li>
          <a
            href="#"
            className={styles.navLink}
            onClick={e => {
              e.preventDefault();
              navigate('/MealPage03');
            }}
          >
            <Utensils size={18} /> Select Meals
          </a>
        </li>
        {/* Meals link */}
        <li>
          <a href="/UserMeals" className={styles.navLink}>
            <Utensils size={18} /> Meals Orders
          </a>
        </li>
        {/* Personalized Suggestions link */}
        <li>
          <a href="#personalized Suggestions" className={styles.navLink}>
            <Sparkles size={18} /> personalized Suggestions
          </a>
        </li>
        {/* Logout link for mobile view */}
        <li className={styles.mobileLogout}>
          <a href="#Logout" onClick={handleLogout} className={styles.navLink}>
            <LogOut size={18} /> Logout
          </a>
        </li>
      </ul>
      {/* Right section with theme toggle, menu toggle, and logout button */}
      <div className={styles.rightSection}>
        {/* Theme toggle button */}
        <button
          onClick={toggleDarkMode}
          className={styles.themeToggle}
          aria-label="Toggle Dark Mode"
        >
          <FontAwesomeIcon
            icon={darkMode ? faSun : faMoon} // Switch icon based on dark mode
            size="lg"
            style={{ fontSize: '20px' }}
          />
        </button>
        {/* Mobile menu toggle button */}
        <button
          onClick={toggleMenu}
          className={styles.menuToggle}
          aria-label="Toggle Menu"
        >
          <FontAwesomeIcon icon={faBars} size="lg" style={{ fontSize: '20px' }} />
        </button>
        {/* Logout button for desktop view */}
        <button
          onClick={handleLogout}
          className={`${styles.logoutButton} ${styles.desktopLogout}`}
          style={{ fontSize: '16px' }}
        >
          <LogOut size={18} style={{ marginRight: '8px' }} /> Logout
        </button>
      </div>
    </nav>
  );
};

// Export the ResponsiveNav component
export default ResponsiveNav;