import { React, useState,useEffect } from "react";
import styles from "./ReportDashboard.module.css";
import ReportCard from "../../../templates/HR/ReportCard/ReportCard";
import img from "../../../../assets/report.png";
import { InputNumber, Button } from "antd";
import axios from "axios";
import Loading from "../../../atoms/loading/loading";

const ReportDashboard = () => {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const urL = import.meta.env.VITE_BASE_URL;

  const handleView = () => {
    console.log("Viewing");
  };
  const handleDownload = () => {
    console.log("Downloading");
  };

  const fetchBudget = async () => {
    try {
      const response = await axios.get(`${urL}/budgets/1`);
      const budgetData = response.data;
  
      setBudget(budgetData.budgetAmount);
      console.log("Budget fetched successfully:", budgetData);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        const payLoad = {
          id: 1,
          name: "Inventory Budget",
          budgetAmount: 0,
        };
        try {
          await axios.post(`${urL}/budgets`, payLoad);
          console.log("Budget created successfully");
          setBudget(0); 
        } catch (createErr) {
          console.error("Error creating budget:", createErr);
        }
      } else {
        console.error("Error fetching budget:", err);
      }
    }
  };

  useEffect(()=>{
    fetchBudget()
  },[])

  const updateBudget = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${urL}/budgets/1`);
      const budgetExists = response.data.exists;
      const payLoad = {
        id: 1,
        name: "Inventory Budget",
        budgetAmount: budget,
      };
      if (budgetExists) {
        await axios.put(`${urL}/budgets/1`, payLoad);
        console.log("Budget updated successfully");
      } else {
        await axios.post(`${urL}/budgets`, payLoad);
        console.log("Budget created successfully");
      }
    } catch (err) {
      console.error("Error updating/creating budget:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }
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
          <Button onClick={updateBudget}>Update Budget</Button>
        </div>
        <div className={styles.bottom}>
          <img src={img}></img>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;
