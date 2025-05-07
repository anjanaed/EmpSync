import React, { useState, useEffect } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { DatePicker, Card } from "antd"; // Import DatePicker and Card from Ant Design
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import "antd/dist/reset.css"; // Import Ant Design styles
import styles from "./Dashbord.module.css";

const { Meta } = Card;

const Dashbord = () => {
  const [activeTab, setActiveTab] = useState("breakfast");
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate(); // Initialize the navigate function
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Update the time every second and set the active tab based on the time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Update activeTab based on the current time
      const currentHour = now.getHours();
      if (currentHour >= 6 && currentHour < 9) {
        setActiveTab("breakfast");
      } else if (currentHour >= 9 && currentHour < 15) {
        setActiveTab("lunch");
      } else if (currentHour >= 15 && currentHour < 24) {
        setActiveTab("dinner");
      }
    }, 1000); // Update every second

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

  // Render content based on the active tab
  const renderTabContent = () => {
    if (activeTab === "breakfast") {
      return (
        <Card
          hoverable
          style={{ width: 240 }}
          cover={
            <img
              alt="Breakfast"
              src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
            />
          }
        >
          <Meta title="Breakfast Menu" description="Delicious breakfast sets" />
        </Card>
      );
    } else if (activeTab === "lunch") {
      return (
        <Card
          hoverable
          style={{ width: 240 }}
          cover={
            <img
              alt="Lunch"
              src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
            />
          }
        >
          <Meta title="Lunch Menu" description="Tasty lunch options" />
        </Card>
      );
    } else if (activeTab === "dinner") {
      return (
        <Card
          hoverable
          style={{ width: 240 }}
          cover={
            <img
              alt="Dinner"
              src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
            />
          }
        >
          <Meta title="Dinner Menu" description="Hearty dinner meals" />
        </Card>
      );
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Order Scheduler Section */}
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
            <button
              className={styles.gotoDashboardButton} // Add a new style for this button
              onClick={() => navigate("/serving")} // Navigate to /serving
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

        <div className={styles.content}>
          {/* Render the card content based on the active tab */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashbord;