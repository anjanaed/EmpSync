import React, { useState } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import styles from "./Dashbord.module.css";

const Dashbord = () => {
  const [activeTab, setActiveTab] = useState("breakfast");
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={styles.dashboardContainer}>
      {/* Menu Scheduler Section */}
      <div className={styles.menuScheduler}>
        <div className={styles.header}>
          <h2 className={styles.title}> Order - {formattedDate}</h2>
          <div className={styles.dateControls}>
            <button className={styles.dateButton}>Tomorrow</button>
            <button className={styles.dateButton}>
              <Calendar className={styles.calendarIcon} size={18} />
              Select Date
            </button>
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