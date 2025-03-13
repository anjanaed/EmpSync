import React from 'react';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import styles from './navbar.module.css';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isSchedulePage = location.pathname === '/kitchen-admin' ;
  const isReportPage = location.pathname === '/report';
  
  const goToSchedule = () => {
    navigate('/kitchen-admin');
  };

  const goToReport = () => {
    navigate('/report');
  };

  return (
    <div className={styles.navbarWrapper}>
      <div className={styles.navbar}>
        <div className={styles.navLinks}>
          <Button 
            className={isSchedulePage ? styles.activeButton : styles.inactiveButton}
            onClick={goToSchedule}
          >
            Schedule
          </Button>
          <Button 
            className={isReportPage ? styles.activeButton : styles.inactiveButton} 
            onClick={goToReport}
          >
            Reports & Analysis
          </Button>
        </div>
        <Button icon={<LogoutOutlined />} className={styles.logoutButton}>
          Log Out
        </Button>
      </div>
      <div className={styles.navbarLine}></div>
    </div>
  );
};

export default Navbar;