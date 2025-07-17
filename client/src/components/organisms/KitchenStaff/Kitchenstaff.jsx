import React, { useState, useEffect } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { DatePicker, Card } from "antd";
import { useNavigate } from "react-router-dom";
import "antd/dist/reset.css";
import styles from "./Kitchenstaff.module.css";

const { Meta } = Card;

// Cart component styles
const cartStyles = {
  cartContainer: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    margin: "20px",
  },
  cartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  cartCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
  },
  imageContainer: {
    width: "100%",
    height: "200px",
    marginBottom: "16px",
    backgroundColor: "#e9ecef",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholder: {
    color: "#6c757d",
    fontSize: "24px",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  itemName: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#333",
    margin: "0",
    flex: "1",
  },
  orderCount: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "80px",
  },
  count: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#333",
    lineHeight: "1",
  },
  countLabel: {
    fontSize: "12px",
    color: "#6c757d",
    textAlign: "center",
    marginTop: "2px",
  },
  mealId: {
    fontSize: "14px",
    color: "#6c757d",
    marginBottom: "8px",
  },
  description: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.4",
    margin: "0",
    marginBottom: "12px",
  },
  ingredients: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  ingredient: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    border: "1px solid #ffeaa7",
  },
  // Popup styles
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  popupContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "30px",
    width: "400px",
    maxWidth: "90vw",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    position: "relative",
  },
  popupHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    borderBottom: "1px solid #e9ecef",
    paddingBottom: "15px",
  },
  popupTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#333",
    margin: 0,
  },
  popupMealId: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "400",
    marginTop: "4px",
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    color: "#666",
    cursor: "pointer",
    padding: "0",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    transition: "background-color 0.2s",
  },
  popupBody: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  countRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },
  countLabel: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
  },
  countValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#d32f2f",
  },
};

const Dashbord = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Breakfast");
  const [manualOverride, setManualOverride] = useState(false);
  const [isViewingTomorrow, setIsViewingTomorrow] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealData, setMealData] = useState({});
  const navigate = useNavigate();

  const currentDate = new Date();
  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch meal data from the backend
  useEffect(() => {
    const fetchMealData = async () => {
      try {
        // Format date for API request
        const dateStr = selectedDate.toISOString().split('T')[0];
        
        // Use the complete backend URL
        const response = await fetch(`http://localhost:3000/meals-serving/meal-counts-by-time?date=${dateStr}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform meal type names to match our tab names
        const transformedData = {};
        Object.entries(data).forEach(([mealType, meals]) => {
          const normalizedType = mealType.toLowerCase();
          if (normalizedType.includes('breakfast')) {
            transformedData['breakfast'] = meals;
          } else if (normalizedType.includes('lunch')) {
            transformedData['lunch'] = meals;
          } else if (normalizedType.includes('dinner')) {
            transformedData['dinner'] = meals;
          }
        });
        
        setMealData(transformedData);
      } catch (error) {
        console.error('Error fetching meal data:', error);
      }
    };

    fetchMealData();
  }, [selectedDate]);

  // Handle manual tab switching
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setManualOverride(true);
  };

  // Handle tomorrow/today button click
  const handleDateToggle = () => {
    if (isViewingTomorrow) {
      setSelectedDate(new Date());
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow);
    }
    setIsViewingTomorrow(!isViewingTomorrow);
  };

  const handleCartItemClick = (item) => {
    setSelectedMeal(item);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedMeal(null);
  };

  const renderPopup = () => {
    if (!showPopup || !selectedMeal) return null;

    return (
      <div style={cartStyles.popupOverlay} onClick={closePopup}>
        <div style={cartStyles.popupContent} onClick={(e) => e.stopPropagation()}>
          <div style={cartStyles.popupHeader}>
            <div>
              <h2 style={cartStyles.popupTitle}>{selectedMeal.name}</h2>
              <p style={cartStyles.popupMealId}>Meal ID: {selectedMeal.mealId}</p>
            </div>
            <button style={cartStyles.closeButton} onClick={closePopup}>
              ×
            </button>
          </div>
          <div style={cartStyles.popupBody}>
            <div style={cartStyles.countRow}>
              <span style={cartStyles.countLabel}>Total Order Count:</span>
              <span style={cartStyles.countValue}>{selectedMeal.totalCount}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render content based on the active tab
  const renderTabContent = () => {
    const meals = mealData[activeTab] || [];
    
    if (meals.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateImage}>
            <img src="/no-data.svg" alt="No data" width={120} height={120} />
            
          </div>
          <p className={styles.emptyStateText}>No meals found for this time period</p>
        </div>
      );
    }

    return (
      <div className={styles.cardContainer}>
        {meals.map((meal) => (
          <div key={meal.mealId} onClick={() => handleCartItemClick(meal)}>
            <div className={styles.card}>
              <img 
                src={meal.imageUrl || '/default-meal-image.jpg'} 
                alt={meal.name} 
                className={styles.cardImage}
              />
              <div className={styles.cardContent}>
                <h3>{meal.name}</h3>
                <p className={styles.mealCountText}>Order Count: {meal.totalCount}</p>
                <p className={styles.mealId}>Meal ID: {meal.mealId}</p>
                {meal.description && (
                  <p className={styles.mealDescription}>
                    {meal.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.menuScheduler}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Order - {formattedDate} {isViewingTomorrow && "(Tomorrow)"}
          </h2>
          <p className={styles.time}>{formattedTime}</p>
          <div className={styles.dateControls}>
            <button 
              className={styles.dateButton}
              onClick={handleDateToggle}
            >
              {isViewingTomorrow ? "Today" : "Tomorrow"}
            </button>
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

        <div className={styles.content}>
          {renderTabContent()}
        </div>
      </div>
      
      {/* Popup */}
      {renderPopup()}
    </div>
  );
};

export default Dashbord;