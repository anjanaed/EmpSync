import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { DatePicker, Card, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext"; // Add authentication context
import "antd/dist/reset.css";
import styles from "./KitchenStaff.module.css";
import '../../../styles/variables.css';

const Dashbord = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [activeTab, setActiveTab] = useState(""); // Will be set dynamically
  const [manualOverride, setManualOverride] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mealData, setMealData] = useState({}); // Dynamic meal data
  const [mealTypes, setMealTypes] = useState([]); // Dynamic meal types
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isViewingTomorrow, setIsViewingTomorrow] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const { authData } = useAuth(); // Get authentication data
  const navigate = useNavigate();
  
  // Refs for real-time updates
  const intervalRef = useRef(null);
  const fetchTimeoutRef = useRef(null);
  const cacheRef = useRef(new Map()); // Simple cache for API responses

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

  // Optimized fetch function with caching and error handling
  const fetchMealData = useCallback(async (dateString, organizationId, forceRefresh = false) => {
    const cacheKey = `${dateString}-${organizationId}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && cacheRef.current.has(cacheKey)) {
      const cachedData = cacheRef.current.get(cacheKey);
      const cacheAge = Date.now() - cachedData.timestamp;
      
      // Use cache if data is less than 30 seconds old
      if (cacheAge < 30000) {
        setMealData(cachedData.data);
        const dynamicMealTypes = Object.keys(cachedData.data);
        setMealTypes(dynamicMealTypes);
        if (!manualOverride && dynamicMealTypes.length > 0) {
          setActiveTab(dynamicMealTypes[0]);
        } else if (dynamicMealTypes.length === 0) {
          setActiveTab("");
        }
        return cachedData.data;
      }
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${baseURL}/meals-serving/meal-counts-by-time?date=${dateString}&orgId=${organizationId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          // Add cache control
          cache: 'no-cache'
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the response
      cacheRef.current.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      // Keep cache size reasonable (max 10 entries)
      if (cacheRef.current.size > 10) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }
      
      // Extract meal types dynamically from the response
      const dynamicMealTypes = Object.keys(data);
      setMealTypes(dynamicMealTypes);
      setMealData(data);
      setLastFetch(Date.now());
      
      // Set default active tab to first meal type if not manually overridden
      if (!manualOverride && dynamicMealTypes.length > 0) {
        setActiveTab(dynamicMealTypes[0]);
      } else if (dynamicMealTypes.length === 0) {
        // No meal types available, clear active tab
        setActiveTab("");
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching meal data:", error);
      message.error(`Failed to load meal data: ${error.message}`);
      
      // Try to use cached data as fallback
      if (cacheRef.current.has(cacheKey)) {
        const cachedData = cacheRef.current.get(cacheKey);
        setMealData(cachedData.data);
        const dynamicMealTypes = Object.keys(cachedData.data);
        setMealTypes(dynamicMealTypes);
        if (dynamicMealTypes.length === 0) {
          setActiveTab("");
        }
        message.warning("Using cached data due to network error");
      }
    } finally {
      setLoading(false);
    }
  }, [manualOverride]);

  // Debounced fetch function to prevent too many API calls
  const debouncedFetch = useCallback((dateString, organizationId, forceRefresh = false) => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      fetchMealData(dateString, organizationId, forceRefresh);
    }, 300); // 300ms debounce
  }, [fetchMealData]);

  // Initial data fetch effect
  useEffect(() => {
    const organizationId = authData?.user?.organizationId;
    if (!organizationId) {
      console.error("No organization ID found in auth data");
      return;
    }

    const dateString = selectedDate.toISOString().split("T")[0];
    debouncedFetch(dateString, organizationId, true); // Force refresh on mount/date change
  }, [selectedDate, authData, debouncedFetch]);

  // Real-time updates effect
  useEffect(() => {
    const organizationId = authData?.user?.organizationId;
    if (!organizationId) return;

    // Set up real-time updates every 30 seconds
    intervalRef.current = setInterval(() => {
      const dateString = selectedDate.toISOString().split("T")[0];
      fetchMealData(dateString, organizationId, true); // Force refresh for real-time updates
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedDate, authData, fetchMealData]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Handle manual tab switching
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setManualOverride(true);
  };

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    const organizationId = authData?.user?.organizationId;
    if (!organizationId) return;
    
    const dateString = selectedDate.toISOString().split("T")[0];
    cacheRef.current.clear(); // Clear cache for fresh data
    fetchMealData(dateString, organizationId, true);
    message.success("Data refreshed successfully");
  }, [selectedDate, authData, fetchMealData]);

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

  // Memoized tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    const meals = mealData[activeTab] || [];
    
    if (loading && meals.length === 0) {
      return (
        <div className={styles.centeredLoading}>
          <Spin size="large" tip="Loading meal data..." />
        </div>
      );
    }

    if (meals.length === 0) {
      return (
        <div className={styles.centeredEmpty}>
          <p>No meals found for {activeTab} on {selectedDate.toLocaleDateString()}</p>
        </div>
      );
    }

    return (
      <div>
        <div className={styles.cardContainer}>
          {meals.map((meal) => (
            <div className={styles.card} key={`${meal.mealId}-${meal.totalCount}`}>
              <div className={styles.cardImageWrapper}>
                <img
                  alt={meal.name}
                  src={meal.imageUrl || "https://via.placeholder.com/240"}
                  className={styles.cardImage}
                  loading="lazy"
                />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardHeaderRow}>
                  <span className={styles.cardTitle}>{meal.name}</span>
                  <span className={styles.cardOrderCount}>{meal.totalCount}</span>
                </div>
                <div className={styles.cardSubRow}>
                  <span className={styles.cardMealId}>Meal ID: {meal.mealId}</span>
                  <span className={styles.cardOrderLabel}>Order Count</span>
                </div>
                {meal.description && (
                  <div className={styles.cardDescription} title={meal.description}>
                    {meal.description}
                  </div>
                )}
                {meal.ingredients && meal.ingredients.length > 0 && (
                  <div className={styles.cardIngredients}>
                    {meal.ingredients.map((ingredient, idx) => (
                      <span className={styles.cardIngredient} key={idx}>
                        {ingredient}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Cart section under each meal tab */}
        <div className={styles.cartGrid}>
          {cartItems.map((item) => (
            <div 
              key={item.id} 
              className={styles.cartCard}
              onClick={() => handleCartItemClick(item)}
              style={{cursor: 'pointer'}}
            >
              <div className={styles.imageContainer}>
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

              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <div className={styles.orderCount}>
                    <span className={styles.count}>{item.orderCount}</span>
                    <span className={styles.orderCountLabel}>Order Count</span>
                  </div>
                </div>

                <div className={styles.mealId}>Meal ID: {item.mealId}</div>

                <p className={styles.description}>{item.description}</p>

                <div className={styles.ingredients}>
                  {item.ingredients.map((ingredient, index) => (
                    <span key={index} className={styles.ingredient}>
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
  }, [mealData, activeTab, loading, selectedDate, cartItems]);

  // Render content based on the active tab
  const renderTabContent = () => {
    return tabContent;
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.menuScheduler}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Order - {formattedDate} {isViewingTomorrow && "(Tomorrow)"}
            {loading && <Spin size="small" style={{ marginLeft: '10px' }} />}
          </h2>
          <p>
            {lastFetch && (
              <span className={styles.lastUpdated}>
                Last updated: {new Date(lastFetch).toLocaleTimeString()}
              </span>
            )}
          </p>
          <div className={styles.dateControls}>
            <button 
              className={styles.dateButton}
              onClick={handleDateToggle}
              disabled={loading}
            >
              {isViewingTomorrow ? "Today" : "Tomorrow"}
            </button>
            <button
              className={styles.dateButton}
              onClick={handleRefresh}
              disabled={loading}
              style={{ marginLeft: '10px', background: '#0a0a0aff',color:'#ffffff' }}
              title="Refresh data"
            >
              Refresh
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
            {loading && mealTypes.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <Spin tip="Loading meal types..." />
              </div>
            ) : (
              mealTypes.map((mealType) => (
                <button
                  key={mealType}
                  className={`${styles.tab} ${
                    activeTab === mealType ? styles.activeTab : ""
                  }`}
                  onClick={() => handleTabSwitch(mealType)}
                  disabled={loading}
                >
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Sets
                  {activeTab === mealType && (
                    <span className={styles.tabCount}>
                      ({mealData[mealType]?.length || 0})
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className={styles.content}>
          {mealTypes.length === 0 && !loading ? (
            <div className={styles.themeEmptyState}>
              <h3>No Orders Found</h3>
              <p>No meals have been ordered for {selectedDate.toLocaleDateString()} yet.</p>
              <p>
                Check back later or try a different date.
              </p>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashbord;