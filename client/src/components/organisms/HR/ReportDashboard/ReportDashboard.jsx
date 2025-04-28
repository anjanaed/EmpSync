import { React, useState } from "react";
import styles from "./ReportDashboard.module.css";
import ReportCard from "../../../templates/HR/ReportCard/ReportCard";
import img from "../../../../assets/report.png";
import { InputNumber } from "antd";


const ReportDashboard = () => {
  const [budget, setBudget] = useState();

  const handleView = () => {
    console.log("Viewing");
  };
  const handleDownload = () => {
    console.log("Downloading");
  };
  return (
    <div className={styles.dash}>
      <div className={styles.mainBox}>
        <div className={styles.mainTitle}>
          <h1>Report Dashboard</h1>
          <span>Access and manage all your reports in one place</span>
        </div>
        <div>
          <ReportCard
            cardTitle={"Supply Cost Report"}
            cardDes={"From Inventory"}
            lastUpdate={"2022/02/22"}
            btnView={handleView}
            btnDownload={handleDownload}
          />
          <ReportCard
            cardTitle={"Meal Cost Analysis Report"}
            cardDes={"From Kitchen"}
            lastUpdate={"2025/02/22"}
            btnView={handleView}
            btnDownload={handleDownload}
          />
        </div>
        <div className={styles.budget}>
          Proposed Budget For Inventory Items: &nbsp;
          <InputNumber
            onChange={(value) => setBudget(value)}
            placeholder="Amount"
            style={{ width: "200px" }}
            formatter={(value) => `${value} LKR`}
            parser={(value) => value.replace(" LKR", "")}
            min={0}
          ></InputNumber>
        </div>
        <div className={styles.bottom}>
          <img src={img}></img>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;
