import React, { useState, useEffect } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import styles from "./KitchenStaff.module.css";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("breakfast");
  const [manualOverride, setManualOverride] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mealData, setMealData] = useState({ breakfast: [], lunch: [], dinner: [] });
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isViewingTomorrow, setIsViewingTomorrow] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cartItems, setCartItems] = useState([]);

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
        const response = await fetch(
          `http://localhost:3000/meals-serving/meal-counts-by-time?date=${selectedDate
            .toISOString()
            .split("T")[0]}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch meal data");
        }
        const data = await response.json();
        setMealData(data);
      } catch (error) {
        console.error("Error fetching meal data:", error);
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
      setIsViewingTomorrow(false);
    } else {
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

  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
  };

  // Render content based on the active tab
  const renderTabContent = () => {
    const meals = mealData[activeTab] || [];
    return (
      <div>
        {/* Meal Cards Grid */}
        <div className={styles.cardGrid}>
          {meals.map((meal) => (
            <div key={meal.mealId} className={styles.mealCard}>
              {/* Image Container */}
              <div className={styles.imageContainer}>
                {meal.imageUrl ? (
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    className={styles.mealImage}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21,15 16,10 5,21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className={styles.cardContent}>
                {/* Header with Name and Count */}
                <div className={styles.cardHeader}>
                  <h3 className={styles.mealName}>
                    {meal.name}
                  </h3>
                  <div className={styles.orderCountSection}>
                    <div className={styles.orderCountNumber}>
                      {meal.totalCount}
                    </div>
                    <div className={styles.orderCountLabel}>
                      Order Count
                    </div>
                  </div>
                </div>

                {/* Meal ID */}
                <div className={styles.mealId}>
                  Meal ID: {meal.mealId}
                </div>

                {/* Description */}
                {meal.description && (
                  <p className={styles.description}>
                    {meal.description}
                  </p>
                )}

                {/* Ingredients */}
                {meal.ingredients && meal.ingredients.length > 0 && (
                  <div className={styles.ingredients}>
                    {meal.ingredients.slice(0, 3).map((ingredient, index) => (
                      <span
                        key={index}
                        className={styles.ingredient}
                      >
                        {ingredient}
                      </span>
                    ))}
                    {meal.ingredients.length > 3 && (
                      <span className={styles.moreIngredients}>
                        +{meal.ingredients.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Cart Items Section */}
        {cartItems.length > 0 && (
          <div className={styles.cartContainer}>
            <div className={styles.cartGrid}>
              {cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className={styles.cartCard}
                  onClick={() => handleCartItemClick(item)}
                >
                  <div className={styles.cartImageContainer}>
                    <div className={styles.imagePlaceholder}>
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

                  <div className={styles.cartCardContent}>
                    <div className={styles.cartCardHeader}>
                      <h3 className={styles.cartItemName}>
                        {item.name}
                      </h3>
                      <div className={styles.cartOrderCount}>
                        <span className={styles.cartCount}>
                          {item.orderCount}
                        </span>
                        <span className={styles.cartOrderCountLabel}>
                          Order Count
                        </span>
                      </div>
                    </div>

                    <div className={styles.cartMealId}>
                      Meal ID: {item.mealId}
                    </div>

                    <p className={styles.cartDescription}>
                      {item.description}
                    </p>

                    <div className={styles.cartIngredients}>
                      {item.ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className={styles.cartIngredient}
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.mainWrapper}>
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
      </div>

      {/* Popup Modal */}
      {showPopup && selectedMeal && (
        <div className={styles.popupOverlay} onClick={closePopup}>
          <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <div>
                <h2 className={styles.popupTitle}>
                  {selectedMeal.name}
                </h2>
                <p className={styles.popupMealId}>
                  Meal ID: {selectedMeal.mealId}
                </p>
              </div>
              <button
                className={styles.closeButton}
                onClick={closePopup}
              >
                <span className={styles.closeButtonIcon}>×</span>
              </button>
            </div>
            <div className={styles.popupBody}>
              <div className={styles.countRow}>
                <span className={styles.countLabel}>Total Order Count:</span>
                <span className={styles.countValue}>
                  {selectedMeal.orderCount}
                </span>
              </div>
              <div className={styles.countRow}>
                <span className={styles.countLabel}>Served Order Count:</span>
                <span className={styles.countValue}>
                  {selectedMeal.serveOrderCount}
                </span>
              </div>
              <div className={styles.countRow}>
                <span className={styles.countLabel}>Pending Order Count:</span>
                <span className={styles.countValue}>
                  {selectedMeal.pendingOrderCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;