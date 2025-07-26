import React, { useState, useEffect } from "react";
import styles from "./Analyze.module.css";
import axios from "axios";
import { Pie } from '@ant-design/plots';

const Analyze = () => {
  const [mealOrderData, setMealOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const urL = import.meta.env.VITE_BASE_URL;
  
  // Get auth data (multiple fallback methods)
  const getAuthData = () => {
    try {
      // Try different possible storage keys
      let authData = JSON.parse(localStorage.getItem('authData') || '{}');
      if (!authData.orgId) {
        authData = JSON.parse(localStorage.getItem('user') || '{}');
      }
      if (!authData.orgId) {
        authData = JSON.parse(sessionStorage.getItem('authData') || '{}');
      }
      return authData;
    } catch (e) {
      console.error('Error parsing auth data:', e);
      return {};
    }
  };

  const getToken = () => {
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') || 
           localStorage.getItem('accessToken') || 
           sessionStorage.getItem('token') || '';
  };

  const authData = getAuthData();
  const token = getToken();

  useEffect(() => {
    fetchAndProcessData();
  }, []);

  const fetchAndProcessData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Auth Data:', authData);
      console.log('Token:', token);
      console.log('Base URL:', urL);

      // Step 1: Fetch all orders for the organization
      console.log('Fetching orders...');
      const ordersResponse = await axios.get(`${urL}/orders`, {
        params: {
          orgId: authData?.orgId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Orders Response:', ordersResponse.data);
      const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : ordersResponse.data.data || [];
      console.log('Processed Orders:', orders);

      // Step 2: Fetch all meals
      console.log('Fetching meals...');
      const mealsResponse = await axios.get(`${urL}/meal?includeDeleted=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Meals Response:', mealsResponse.data);
      const meals = Array.isArray(mealsResponse.data) ? mealsResponse.data : mealsResponse.data.data || [];
      console.log('Processed Meals:', meals);

      // Step 3: Process orders to calculate meal demand
      const mealDemandMap = new Map();

      console.log('Processing orders...');
      orders.forEach((order, index) => {
        console.log(`Processing order ${index + 1}:`, order);
        
        if (order.meals && Array.isArray(order.meals)) {
          order.meals.forEach(mealString => {
            console.log('Processing meal string:', mealString);
            
            // Parse meal string format "3:1" (mealId:quantity)
            const [mealId, quantity] = mealString.split(':').map(Number);
            console.log('Parsed - MealId:', mealId, 'Quantity:', quantity);
            
            if (mealId && quantity && !isNaN(mealId) && !isNaN(quantity)) {
              const currentCount = mealDemandMap.get(mealId) || 0;
              mealDemandMap.set(mealId, currentCount + quantity);
              console.log(`Updated meal ${mealId} count to:`, currentCount + quantity);
            } else {
              console.warn('Invalid meal data:', { mealId, quantity, mealString });
            }
          });
        } else {
          console.warn('Order has no meals or meals is not an array:', order);
        }
      });

      console.log('Final meal demand map:', Array.from(mealDemandMap.entries()));

      // Step 4: Calculate total orders and create meal data with percentages
      const totalOrders = Array.from(mealDemandMap.values()).reduce((sum, count) => sum + count, 0);
      console.log('Total orders:', totalOrders);
      
      if (totalOrders === 0) {
        console.warn('No orders found or processed');
        setMealOrderData([]);
        return;
      }

      const mealData = Array.from(mealDemandMap.entries())
        .map(([mealId, orderCount]) => {
          // Find meal name from meals array
          const meal = meals.find(m => m.id === mealId);
          const mealName = meal ? meal.nameEnglish : `Meal ID: ${mealId}`;
          const percentage = totalOrders > 0 ? parseFloat(((orderCount / totalOrders) * 100).toFixed(1)) : 0;
          
          console.log(`Meal ${mealId} (${mealName}): ${orderCount} orders, ${percentage}%`);
          
          return {
            id: mealId,
            name: mealName,
            orders: orderCount,
            percentage: percentage,
            type: mealName // Used for colorField in pie chart
          };
        })
        .filter(item => item.orders > 0) // Only include meals with orders
        .sort((a, b) => b.orders - a.orders); // Sort by highest demand first

      console.log('Final meal data:', mealData);
      
      if (mealData.length === 0) {
        console.warn('No meal data to display');
        setMealOrderData([]);
        return;
      }
      
      setMealOrderData(mealData);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(`Failed to fetch meal data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Top 4 meals for ranking display
  const topMeals = mealOrderData.slice(0, 4);

  // Colors for the pie chart segments
  const COLORS = [
    '#FF6B6B', // Red for highest demand
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD'  // Purple for lowest demand
  ];

  // Prepare pie chart data with proper structure
  const pieChartData = mealOrderData.map((item, index) => ({
    id: item.id,
    name: item.name || `Meal ${item.id}`, // Ensure name exists
    orders: item.orders,
    percentage: item.percentage,
    type: item.name || `Meal ${item.id}`,
    color: COLORS[index % COLORS.length]
  }));

  console.log('Pie Chart Data with names:', pieChartData);

  // Ant Design Ring/Donut Chart Configuration
  const pieConfig = {
    data: pieChartData,
    angleField: 'orders',
    colorField: 'type',
    radius: 0.9,
    innerRadius: 0.6, // This creates the ring/donut effect
    color: COLORS,
    label: {
      type: 'inner',
      offset: '-30%',
      content: '{percentage}%',
      style: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#fff'
      }
    },
    legend: {
      position: 'bottom',
      offsetY: 10,
      itemName: {
        style: {
          fontSize: 12,
          fontWeight: 'normal'
        }
      }
    },
    // Working tooltip configuration
    tooltip: {
      fields: ['name', 'orders', 'percentage'],
      formatter: (datum) => {
        return {
          name: datum.name || 'Meal',
          value: `${datum.percentage}% (${datum.orders} orders)`
        };
      }
    },
    interactions: [
      { type: 'element-active' },
      { type: 'element-selected' }
    ],
    // Center statistic for ring chart
    statistic: {
      title: {
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#666'
        },
        content: 'Total Orders'
      },
      content: {
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1890ff'
        },
        content: pieChartData.reduce((sum, item) => sum + item.orders, 0).toString()
      }
    },
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1000
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Kitchen Analyze Section</h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading meal data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Kitchen Analyze Section</h2>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <p>{error}</p>
          <button onClick={fetchAndProcessData}>Retry</button>
        </div>
      </div>
    );
  }

  // No data state
  if (mealOrderData.length === 0 && !loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Kitchen Analyze Section</h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No meal order data available for this organization.</p>
          <button onClick={fetchAndProcessData} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Kitchen Analyze Section</h2>
      
      <div className={styles.cardsContainer}>
        {/* Left Card - Ring Chart */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Meal Distribution</h3>
          <div className={styles.pieChartContainer}>
            {pieChartData.length > 0 ? (
              <Pie {...pieConfig} />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>No data to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Card - Top 4 Rankings */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Top {Math.min(4, mealOrderData.length)} Meal Rankings</h3>
          <div className={styles.rankingsContainer}>
            {topMeals.length > 0 ? (
              topMeals.map((meal, index) => (
                <div key={meal.id} className={styles.rankingItem}>
                  <div className={styles.rankingLeft}>
                    <div 
                      className={styles.colorIndicator}
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div className={styles.mealInfo}>
                      <p className={styles.mealName}>{meal.name}</p>
                      <p className={styles.mealRank}>Rank #{index + 1}</p>
                    </div>
                  </div>
                  <div className={styles.orderInfo}>
                    <p className={styles.orderCount}>{meal.orders}</p>
                    <p className={styles.orderPercentage}>{meal.percentage}%</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>No rankings to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;