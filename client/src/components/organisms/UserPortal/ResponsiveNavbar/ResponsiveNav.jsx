import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext.jsx';
import { useTheme } from '../../../../contexts/ThemeContext.jsx';
import {
  MenuOutlined,
  UserOutlined,
  CreditCardOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  AppstoreOutlined,
  BellOutlined
} from '@ant-design/icons';
import styles from './ResponsiveNav.module.css';
import logoImg from '../../../../assets/Logo/logo.png';
import logowImg from '../../../../assets/Logo/logow.png';


// ResponsiveNav component for navigation bar
const ResponsiveNav = () => {
  // State to manage mobile menu visibility
  const [menuOpen, setMenuOpen] = useState(false);
  // State to manage notification count
  const [notificationCount, setNotificationCount] = useState(3); // Example count
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // Destructure logout function and authData from AuthContext
  const { logout, authData } = useAuth();
  // Use theme context instead of local state
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

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

  // Handle notification click
  const handleNotificationClick = () => {
    // Add your notification handling logic here
    console.log("Notification clicked");
    navigate('/notifications'); // Navigate to notifications page
  };

  // Render navigation bar
  return (
    <nav className={`${styles.navbar} ${isDark ? styles.dark : ''}`}>
      {/* Company logo section */}
      <div className={styles.companyName}>
        <img
          className={styles.logo}
          src={isDark ? logowImg : logoImg}
          alt="Logo"
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
          <a 
            href="#"
            className={styles.navLink}
            onClick={e => {
              e.preventDefault();
              navigate('/UserPayroll');
            }}
          >
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
            <AppstoreOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
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
        {/* Notification icon only */}
        <div className={styles.notificationContainer}>
          <BellOutlined style={{ fontSize: '20px' }} />
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className={styles.darkModeToggle}
          aria-label="Toggle Dark Mode"
        >
          {isDark ? (
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
