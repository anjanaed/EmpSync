import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import {
  MenuOutlined,
  UserOutlined,
  CreditCardOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import styles from './ResponsiveNav.module.css';
import Companylogo from '../../../../assets/Logo/logo.png';

// ResponsiveNav component for navigation bar
const ResponsiveNav = () => {
  // State to manage mobile menu visibility
  const [menuOpen, setMenuOpen] = useState(false);
  // State to manage dark mode
  const [darkMode, setDarkMode] = useState(false);
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // Destructure logout function and authData from AuthContext
  const { logout, authData } = useAuth();

  // Toggle mobile menu visibility
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Add your dark mode logic here (e.g., update theme context, localStorage, etc.)
    document.documentElement.setAttribute('data-theme', darkMode ? 'light' : 'dark');
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
          src={Companylogo} // Use default logo
          alt="Company Logo"
          className={styles.logo}
        />
      </div>

      {/* Navigation links */}
      <ul className={`${styles.navLinks} ${menuOpen ? styles.active : ''}`}>
        {/* Profile link */}
        <li>
          <a href="/ProfilePage" className={styles.navLink}>
            <UserOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
            Profile
          </a>
        </li>
        
        {/* Payroll link */}
        <li>
          <a href="#Payroll" className={styles.navLink}>
            <CreditCardOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
            Payroll
          </a>
        </li>
        
        {/* Select Meals link */}
        <li>
          <a
            href="#"
            className={styles.navLink}
            onClick={e => {
              e.preventDefault();
              navigate('/MealPage03');
            }}
          >
            <ShoppingCartOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
            Select Meals
          </a>
        </li>
        
        {/* Meal Orders link */}
        <li>
          <a href="/UserMeals" className={styles.navLink}>
            <ShoppingCartOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
            Meal Orders
          </a>
        </li>
        
        {/* Logout link for mobile view */}
        <li className={styles.mobileLogout}>
          <a href="#Logout" onClick={handleLogout} className={`${styles.navLink} ${styles.logoutLinkMobile}`}>
            <LogoutOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
            Logout
          </a>
        </li>
      </ul>

      {/* Right section with controls */}
      <div className={styles.rightSection}>
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={styles.darkModeToggle}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <SunOutlined style={{ fontSize: '20px' }} />
          ) : (
            <MoonOutlined style={{ fontSize: '20px' }} />
          )}
        </button>

        {/* Mobile menu toggle button */}
        <button
          onClick={toggleMenu}
          className={styles.menuToggle}
          aria-label="Toggle Menu"
        >
          <MenuOutlined style={{ fontSize: '20px' }} />
        </button>

        {/* Logout button for desktop view */}
        <button
          onClick={handleLogout}
          className={`${styles.logoutButton} ${styles.desktopLogout}`}
        >
          <LogoutOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
          Logout
        </button>
      </div>
    </nav>
  );
};

// Export the ResponsiveNav component
export default ResponsiveNav;