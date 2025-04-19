import React, { useState } from "react";
import { Card, Progress } from "antd";
import styles from "./reportSection.module.css";

const Report = () => {
  const [activeTab, setActiveTab] = useState("daily");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const highDemandMeals = [
    { name: "Rice & Curry", percentage: 85 },
  ];

  const lowDemandMeals = [
    { name: "Plain Rice", percentage: 12 },
  ];

  return (
    <div className={styles.container}>
      {/* Analysis Section */}
      <div className={styles.analysisContainer}>
        <h2 className={styles.heading}> Analysis</h2>

        <div className={styles.cardsContainer}>
          <Card title="High Demand Meals" className={styles.card}>
            {highDemandMeals.map((meal) => (
              <div key={meal.name} className={styles.mealItem}>
                <span>{meal.name}</span>
                <Progress percent={meal.percentage} showInfo={false} strokeColor="rgb(224, 0, 0)" />
              </div>
            ))}
          </Card>

          <Card title="Low Demand Meals" className={styles.card}>
            {lowDemandMeals.map((meal) => (
              <div key={meal.name} className={styles.mealItem}>
                <span>{meal.name}</span>
                <Progress percent={meal.percentage} showInfo={false} strokeColor="rgb(224, 0, 0)" />
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Report Section */}
      <div className={styles.reportContainer}>
        <div className={styles.reportHeader}>
          <div className={styles.iconTitle}>
            <span className={styles.clockIcon}></span>
            <h2 className={styles.heading}>Reports</h2>
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
              {/* <div className={styles.circleIcon}> */}
                {/* <span className={styles.chartIcon}>📊</span> */}
              {/* </div> */}
            </div>
            <h3 className={styles.reportTitle}>Meal Consumption Report</h3>
            <p className={styles.reportDescription}>
              View detailed statistics about meal consumption for this daily period
            </p>
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <button className={styles.downloadButton}>
            <span className={styles.downloadIcon}></span>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Report;
