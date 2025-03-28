import React from "react";
import styles from "./ReportDashboard.module.css";
import ReportCard from "../../templates/ReportCard/ReportCard";

const ReportDashboard = () => {

    const handleView=()=>{
        console.log("Viewing")
    }
    const handleDownload=()=>{
        console.log("Downloading")
    }
  return (
    <div className={styles.mainBox}>
      <div className={styles.mainTitle}>
        <h1>Report Dashboard</h1>
        <span>Access and manage all your reports in one place</span>
      </div>
      <div>
        <ReportCard cardTitle={"Supply Cost Report"} cardDes={"From Inventory"} lastUpdate={"2022/02/22"} btnView={handleView} btnDownload={handleDownload} />
        <ReportCard cardTitle={"Meal Cost Analysis Report"} cardDes={"From Kitchen"} lastUpdate={"2025/02/22"} btnView={handleView} btnDownload={handleDownload} />



        {/* <div className={styles.card}>
          <div className={styles.left}>
            <div className={styles.cardTitle}>
              Supply Cost Report
              <br /> <span>From Inventory</span>
            </div>
            <div className={styles.lastUpdate}>
              <span>*</span> Last Update: 2025/02/22{" "}
            </div>
          </div>
          <div className={styles.right}>
            <button className={styles.btn1}>View</button>
            <button className={styles.btn2}>Download</button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ReportDashboard;
