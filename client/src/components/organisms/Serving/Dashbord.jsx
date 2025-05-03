import React, { useState, useEffect } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { DatePicker } from "antd"; // Import DatePicker from Ant Design
import "antd/dist/reset.css"; // Import Ant Design styles
import styles from "./Dashbord.module.css";

const Dashbord = () => {
  const [activeTab, setActiveTab] = useState("breakfast");
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // Cleanup the interval on component unmount
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Handle date selection
  const handleDateChange = (date, dateString) => {
    console.log("Selected Date:", dateString);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Menu Scheduler Section */}
      <div className={styles.menuScheduler}>
        <div className={styles.header}>
          <h2 className={styles.title}>Order - {formattedDate}</h2>
          <p className={styles.time}>{formattedTime}</p>
          <div className={styles.dateControls}>
            <button className={styles.dateButton}>Tomorrow</button>
            <DatePicker
              className={styles.datePicker}
              onChange={handleDateChange}
              placeholder="Select Date"
            />
          </div>
        </div>

        <div className={styles.tabContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${
                activeTab === "breakfast" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("breakfast")}
            >
              Breakfast Sets
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "lunch" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("lunch")}
            >
              Lunch Set
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "dinner" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("dinner")}
            >
              Dinner Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashbord;