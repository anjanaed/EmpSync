import React from 'react';
import styles from './ResponsiveNav.module.css';

const ResponsiveNav = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.companyName}>Company Name</div>
      <ul className={styles.navLinks}>
        <li><a href="#meel" className={styles.navLink}>Meel</a></li>
        <li><a href="#account" className={styles.navLink}>Account</a></li>
        <li><a href="#payroll" className={styles.navLink}>Payroll</a></li>
        <li><a href="#aisuggestion" className={styles.navLink}>AI Suggestion</a></li>
      </ul>
    </nav>
  );
};

export default ResponsiveNav;