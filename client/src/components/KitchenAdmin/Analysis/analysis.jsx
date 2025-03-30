import React from "react";
import { Card, Progress } from "antd";
import styles from "./analysis.module.css";

const AnalysisSection = () => {
  const highDemandMeals = [
    { name: "Rice & Curry", percentage: 85 },
    
  ];

  const lowDemandMeals = [
    
    { name: "Plain Rice", percentage: 12 },
  ];

  return (
    <div className={styles.analysisContainer}>
      <h2 className={styles.heading}>📊 Analysis</h2>

      <div className={styles.cardsContainer}>
        {/* High Demand Meals */}
        <Card title="High Demand Meals" className={styles.card}>
          {highDemandMeals.map((meal) => (
            <div key={meal.name} className={styles.mealItem}>
              <span>{meal.name}</span>
              <Progress percent={meal.percentage} showInfo={false} strokeColor="#8B1E3F" />
            </div>
          ))}
        </Card>

        {/* Low Demand Meals */}
        <Card title="Low Demand Meals" className={styles.card}>
          {lowDemandMeals.map((meal) => (
            <div key={meal.name} className={styles.mealItem}>
              <span>{meal.name}</span>
              <Progress percent={meal.percentage} showInfo={false} strokeColor="#8B1E3F" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default AnalysisSection;
