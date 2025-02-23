import React from "react";
import Navbar from "../../../components/KitchenAdmin/KitchenNavbar/navbar";
import styles from "./report.module.css"; // Import the CSS module
import { Card, Button } from "antd";

const Report = () => {
  return (
    <div className={styles.container}>
      <Navbar /> 
      <div className={styles.sectionContainer}>
      {/* Analysis Section */}
      <Card className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Analysis</h3>
        <div className={styles.analysisContainer}>
        <Card className={styles.analysisCard} title="High demand Meal">
             <p className={styles.mealName}>Chicken with Rice</p>
        </Card>
        <Card className={styles.analysisCard} title="Low demand Meal">
              <p className={styles.mealName}>Milk Rice</p>
        </Card>
        </div>
      </Card>

       {/* Reports Section */}
       <Card className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Reports</h3>
        <div className={styles.reportBox} ></div>
        <div className={styles.buttonContainer}>
          <Button type="primary" className={styles.downloadBtn}>Download PDF</Button>
        </div>
      </Card>
    </div>
    </div>
  );
};

export default Report;