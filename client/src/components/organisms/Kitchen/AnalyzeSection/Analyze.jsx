import React, { useState, useEffect } from "react";
import styles from "./Analyze.module.css";
import axios from "axios";
import { Pie } from '@ant-design/plots';
import { useAuth } from "../../../../contexts/AuthContext.jsx";

const Analyze = () => {
  const [mealOrderData, setMealOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalMealOrders, setTotalMealOrders] = useState(0);
  
  const { authData } = useAuth();
  const token = authData?.accessToken;
  const urL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchMealAnalytics();
  }, []);

  const fetchMealAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);


      if (!authData?.orgId) {
        setError('Organization ID not found. Please check your authentication.');
        setLoading(false);
        return;
      }

      // Call the  API endpoint
      console.log('Fetching meal analytics from API...');
      const response = await axios.get(`${urL}/orders/analytics/meals`, {
        params: {
          orgId: authData.orgId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('API Response:', response.data);
      
      const { totalOrders: apiTotalOrders, totalMealOrders: apiTotalMealOrders, mealAnalytics } = response.data;
      
      
      setTotalOrders(apiTotalOrders);
      setTotalMealOrders(apiTotalMealOrders);

      // Transform API data to match the component's expected format
      const transformedData = mealAnalytics.map((item, index) => ({
        id: item.mealId,
        name: item.mealName || `Meal ID: ${item.mealId}`,
        orders: item.orderCount,
        percentage: item.percentage,
        type: item.mealName || `Meal ID: ${item.mealId}`, // Used for colorField in pie chart
      }));

      console.log('Transformed meal data:', transformedData);
      
      if (transformedData.length === 0) {
        console.warn('No meal data to display');
        setMealOrderData([]);
        return;
      }
      
      setMealOrderData(transformedData);
      
    } catch (err) {
      console.error('Error fetching meal analytics:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // More specific error messages
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err.response?.status === 400) {
        setError('Invalid request. Please check your organization ID.');
      } else if (err.response?.status === 404) {
        setError('API endpoint not found. Please check the server configuration.');
      } else {
        setError(`Failed to fetch meal analytics: ${err.message}`);
      }
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
        content: 'Total Meal Orders'
      },
      content: {
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1890ff'
        },
        content: totalMealOrders.toString()
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
          <div style={{ fontSize: '16px', marginBottom: '1rem' }}>Loading meal analytics...</div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1890ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Kitchen Analyze Section</h2>
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          backgroundColor: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '8px',
          margin: '1rem'
        }}>
          <div style={{ color: '#ff4d4f', fontSize: '16px', marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
          <button 
            onClick={fetchMealAnalytics}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (mealOrderData.length === 0 && !loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Kitchen Analyze Section</h2>
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          backgroundColor: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '8px',
          margin: '1rem'
        }}>
          <div style={{ color: '#52c41a', fontSize: '16px', marginBottom: '1rem' }}>
            📊 No meal order data available for this organization.
          </div>
          <div style={{ color: '#666', fontSize: '14px', marginBottom: '1rem' }}>
            Total Orders: {totalOrders} | Total Meal Orders: {totalMealOrders}
          </div>
          <button 
            onClick={fetchMealAnalytics}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Kitchen Analyze Section</h2>
      
      {/* Summary Stats */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '2rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          padding: '1rem 2rem',
          backgroundColor: '#f0f9ff',
          border: '2px solid #1890ff',
          borderRadius: '8px',
          textAlign: 'center',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
            {totalOrders}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Total Orders
          </div>
        </div>
        <div style={{
          padding: '1rem 2rem',
          backgroundColor: '#f6ffed',
          border: '2px solid #52c41a',
          borderRadius: '8px',
          textAlign: 'center',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
            {totalMealOrders}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Total Meal Orders
          </div>
        </div>
        <div style={{
          padding: '1rem 2rem',
          backgroundColor: '#fff7e6',
          border: '2px solid #fa8c16',
          borderRadius: '8px',
          textAlign: 'center',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
            {mealOrderData.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Different Meals
          </div>
        </div>
      </div>
      
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