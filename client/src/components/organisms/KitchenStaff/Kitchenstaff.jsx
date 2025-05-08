import React, { useState, useEffect } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { DatePicker, Card } from "antd";
import { useNavigate } from "react-router-dom";
import "antd/dist/reset.css";
import styles from "./Kitchenstaff.module.css";

const { Meta } = Card;

const Dashbord = () => {
  const [activeTab, setActiveTab] = useState("breakfast");
  const [manualOverride, setManualOverride] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mealData, setMealData] = useState({ breakfast: [], lunch: [], dinner: [] }); // State to store meal data
  const navigate = useNavigate();

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Fetch meal data from the backend
  useEffect(() => {
    const fetchMealData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/meals-serving/meal-counts-by-time?date=${currentDate.toISOString().split("T")[0]}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch meal data");
        }
        const data = await response.json();
        setMealData(data); // Update state with fetched data
      } catch (error) {
        console.error("Error fetching meal data:", error);
      }
    };

    fetchMealData();
  }, [currentDate]);

  // Handle manual tab switching
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setManualOverride(true);
  };

  // Render content based on the active tab
  const renderTabContent = () => {
    const meals = mealData[activeTab] || [];
    return meals.map((meal) => (
      <Card
        key={meal.mealId}
        hoverable
        style={{ width: 240 }}
        cover={
          <img
            alt={meal.name}
            src={meal.imageUrl || "https://via.placeholder.com/240"} // Use Firebase image or fallback
            style={{ height: 200 }} // Set image height to 300px
          />
        }
      >
        <Meta
          title={`${meal.name} `}
          description={
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>
              Total Count: {meal.totalCount}
            </span>
          } // Make text bold and font size 18px
        />
      </Card>
    ));
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.menuScheduler}>
        <div className={styles.header}>
          <h2 className={styles.title}>Order - {formattedDate}</h2>
          <p className={styles.time}>{formattedTime}</p>
          <div className={styles.dateControls}>
            <button className={styles.dateButton}>Tomorrow</button>
            <button
              className={styles.gotoDashboardButton}
              onClick={() => navigate("/serving")}
            >
              Goto Serving
            </button>
          </div>
        </div>

        <div className={styles.tabContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${
                activeTab === "breakfast" ? styles.activeTab : ""
              }`}
              onClick={() => handleTabSwitch("breakfast")}
            >
              Breakfast Sets
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "lunch" ? styles.activeTab : ""
              }`}
              onClick={() => handleTabSwitch("lunch")}
            >
              Lunch Set
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "dinner" ? styles.activeTab : ""
              }`}
              onClick={() => handleTabSwitch("dinner")}
            >
              Dinner Set
            </button>
          </div>
        </div>

        <div className={styles.content}>{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default Dashbord;