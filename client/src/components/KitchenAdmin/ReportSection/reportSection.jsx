import React, { useState } from 'react';
import styles from './reportSection.module.css';

const ReportSection = () => {
  const [activeTab, setActiveTab] = useState('daily');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportHeader}>
        <div className={styles.iconTitle}>
          <span className={styles.clockIcon}>⏱</span>
          <h2>Reports</h2>
        </div>
      </div>
      
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'daily' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('daily')}
        >
          Daily
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'weekly' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('weekly')}
        >
          Weekly
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'monthly' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('monthly')}
        >
          Monthly
        </button>
      </div>
      
      <div className={styles.reportPanel}>
        <div className={styles.reportContent}>
          <div className={styles.reportIconContainer}>
            <div className={styles.circleIcon}>
              <span className={styles.chartIcon}>⏱</span>
            </div>
          </div>
          <h3 className={styles.reportTitle}>Meal Consumption Report</h3>
          <p className={styles.reportDescription}>
            View detailed statistics about meal consumption for this daily period
          </p>
        </div>
      </div>
      
      <div className={styles.buttonContainer}>
        <button className={styles.downloadButton}>
          <span className={styles.downloadIcon}>📄</span>
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ReportSection;