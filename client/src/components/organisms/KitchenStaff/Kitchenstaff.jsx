import React, { useState, useEffect } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { DatePicker, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext"; // Add authentication context
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
  orderCountLabel: {
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
  const [activeTab, setActiveTab] = useState(""); // Will be set dynamically
  const [manualOverride, setManualOverride] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mealData, setMealData] = useState({}); // Dynamic meal data
  const [mealTypes, setMealTypes] = useState([]); // Dynamic meal types
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isViewingTomorrow, setIsViewingTomorrow] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cartItems, setCartItems] = useState([]);
  const { authData } = useAuth(); // Get authentication data
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

  // Fetch meal data from the backend
  useEffect(() => {
    const fetchMealData = async () => {
      try {
        // Get organization ID from authentication data
        const organizationId = authData?.user?.organizationId;
        if (!organizationId) {
          console.error("No organization ID found in auth data");
          return;
        }

        const dateString = selectedDate.toISOString().split("T")[0];
        const response = await fetch(
          `http://localhost:3000/meals-serving/meal-counts-by-time?date=${dateString}&orgId=${organizationId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch meal data");
        }
        const data = await response.json();
        
        // Extract meal types dynamically from the response
        const dynamicMealTypes = Object.keys(data);
        setMealTypes(dynamicMealTypes);
        setMealData(data);
        
        // Set default active tab to first meal type if not manually overridden
        if (!manualOverride && dynamicMealTypes.length > 0) {
          setActiveTab(dynamicMealTypes[0]);
        }
      } catch (error) {
        console.error("Error fetching meal data:", error);
      }
    };

    if (authData?.user?.organizationId) {
      fetchMealData();
    }
  }, [selectedDate, authData, manualOverride]);

  // Handle manual tab switching
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setManualOverride(true);
  };

  // Handle tomorrow/today button click
  const handleDateToggle = () => {
    if (isViewingTomorrow) {
      // Switch back to today
      setSelectedDate(new Date());
      setIsViewingTomorrow(false);
    } else {
      // Switch to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow);
      setIsViewingTomorrow(true);
    }
  };

  const updateOrderCount = (id, newCount) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, orderCount: Math.max(0, newCount) } : item
      )
    );
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
              <span style={cartStyles.countValue}>{selectedMeal.orderCount}</span>
            </div>
            <div style={cartStyles.countRow}>
              <span style={cartStyles.countLabel}>Served Order Count:</span>
              <span style={cartStyles.countValue}>{selectedMeal.serveOrderCount}</span>
            </div>
            <div style={cartStyles.countRow}>
              <span style={cartStyles.countLabel}>Pending Order Count:</span>
              <span style={cartStyles.countValue}>{selectedMeal.pendingOrderCount}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render content based on the active tab
  const renderTabContent = () => {
    const meals = mealData[activeTab] || [];
    return (
      <div>
        <div className={styles.cardContainer}>
          {meals.map((meal) => (
            <Card
              key={meal.mealId}
              hoverable
              className={styles.card} // Add a class for the card
              cover={
                <img
                  alt={meal.name}
                  src={meal.imageUrl || "https://via.placeholder.com/240"} // Use Firebase image or fallback
                  className={styles.cardImage} // Add a class for the image
                />
              }
            >
              <Meta
                title={`${meal.name}`}
                description={
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      Meal ID: {meal.mealId}
                    </div>
                    {meal.description && (
                      <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px', lineHeight: '1.3' }}>
                        {meal.description}
                      </div>
                    )}
                    {meal.ingredients && meal.ingredients.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#444', marginBottom: '4px' }}>
                          Ingredients:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {meal.ingredients.map((ingredient, index) => (
                            <span 
                              key={index} 
                              style={{
                                backgroundColor: '#fff3cd',
                                color: '#856404',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '10px',
                                fontWeight: '500',
                                border: '1px solid #ffeaa7',
                              }}
                            >
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <span className={styles.mealCountText}>
                      Total Count: {meal.totalCount}
                    </span>
                  </div>
                } // Add a class for the meal count text
              />
            </Card>
          ))}
        </div>
        
        {/* Cart section under each meal tab */}
        
          {/* <h3 style={{ margin: '20px 0', fontSize: '20px', fontWeight: '600', color: '#333' }}>
            Cart Items for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h3> */}
          <div style={cartStyles.cartGrid}>
            {cartItems.map((item) => (
              <div 
                key={item.id} 
                style={{...cartStyles.cartCard, cursor: 'pointer'}} 
                onClick={() => handleCartItemClick(item)}
              >
                <div style={cartStyles.imageContainer}>
                  <div style={cartStyles.imagePlaceholder}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21,15 16,10 5,21" />
                    </svg>
                  </div>
                </div>

                <div style={cartStyles.cardContent}>
                  <div style={cartStyles.cardHeader}>
                    <h3 style={cartStyles.itemName}>{item.name}</h3>
                    <div style={cartStyles.orderCount}>
                      <span style={cartStyles.count}>{item.orderCount}</span>
                      <span style={cartStyles.orderCountLabel}>Order Count</span>
                    </div>
                  </div>

                  <div style={cartStyles.mealId}>Meal ID: {item.mealId}</div>

                  <p style={cartStyles.description}>{item.description}</p>

                  <div style={cartStyles.ingredients}>
                    {item.ingredients.map((ingredient, index) => (
                      <span key={index} style={cartStyles.ingredient}>
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            {mealTypes.map((mealType) => (
              <button
                key={mealType}
                className={`${styles.tab} ${
                  activeTab === mealType ? styles.activeTab : ""
                }`}
                onClick={() => handleTabSwitch(mealType)}
              >
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Sets
              </button>
            ))}
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