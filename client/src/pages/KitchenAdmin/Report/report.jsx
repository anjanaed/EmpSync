import React from "react";
import Navbar from "../../../components/KitchenAdmin/KitchenNavbar/navbar";
import Section from "../../../components/KitchenAdmin/ReportSection/reportSection";
import Analysis from "../../../components/KitchenAdmin/Analysis/analysis";
import styles from "./report.module.css"; // Import the CSS module
// import { Card, Button } from "antd";

const Report = () => {
  return (
    <div className={styles.container}>
      <Navbar /> 
      <div className={styles.sectionContainer}>
      {/* Analysis Section */}
      <Analysis/>

       {/* Reports Section */}
      <Section/>
    </div>
    </div>
  );
};

export default Report;