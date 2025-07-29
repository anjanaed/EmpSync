import React, { useState, useEffect } from "react";
import styles from "./Analyze.module.css";
import axios from "axios";
import { Card, Progress } from "antd";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext.jsx";


const Analyze = () => {
  const [mealOrderData, setMealOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalMealOrders, setTotalMealOrders] = useState(0);
  const [error, setError] = useState(null);

  const { authData } = useAuth();
  const token = authData?.accessToken;
  const urL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchMealAnalytics();
  }, []);

  const fetchMealAnalytics = async () => {
    try {
      
      const response = await axios.get(`${urL}/orders/analytics/meals`, {
        params: { orgId: authData.orgId },
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        totalOrders: apiTotalOrders,
        totalMealOrders: apiTotalMealOrders,
        mealAnalytics,
      } = response.data;

      setTotalOrders(apiTotalOrders);
      setTotalMealOrders(apiTotalMealOrders);

      const transformed = mealAnalytics.map((item) => ({
        mealId: item.mealId,
        name: item.mealName,
        count: item.orderCount,
        percentage: item.percentage,
      }));

      setMealOrderData(transformed);
    } catch (err) {
      console.error("Failed to fetch meal analytics:", err);
      setError("Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const top3Meals = [...mealOrderData]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  
  return (
    <div className={styles.container}>
      <div className={styles.analysisSection}>
        <div className={styles.sectionHeader}>
          <TrendingUp className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Meal Demand Analysis</h2>
        </div>

        <div className={styles.analysisGrid}>
          {/* Highest Demand Meals Card */}
          <Card
            title={
              <div className={styles.cardTitle}>
                <TrendingUp className={styles.highDemandIcon} size={18} />
                Top 3 Highest Demand Meals
              </div>
            }
            className={styles.card}
            loading={loading}
          >
            {top3Meals.length ? (
              top3Meals.map((meal) => (
                <div key={meal.mealId} className={styles.mealItem}>
                  <div className={styles.mealHeader}>
                    <span className={styles.mealName}>{meal.name}</span>
                    <span className={styles.mealStats}>
                      {meal.count} orders ({meal.percentage}%)
                    </span>
                  </div>
                  <Progress
                    percent={meal.percentage}
                    strokeColor="#52c41a"
                    trailColor="#f0f0f0"
                    showInfo={false}
                  />
                  <div className={styles.mealDetails}>
                    <span className={styles.mealId}>
                      Meal ID: {meal.mealId}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noDataMessage}>
                No high demand meal data available
              </div>
            )}
          </Card>

          {/* Total Meal Orders + Different Meals Cards */}
          <div className={styles.summaryGrid}>
            <Card className={styles.summaryCard}>
              <div className={styles.cardContent}>
                <div>
                  <h3 className={styles.cardLabel}>Total Orders</h3>
                  <div
                    className={styles.cardValue}
                    style={{ color: "#2f54eb" }}
                  >
                    {totalOrders}
                  </div>
                  <p className={styles.cardSubtext}>All order types</p>
                </div>
                <div className={`${styles.cardIcon} ${styles.blueBg}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.iconSvg}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 17l6-6 4 4 8-8"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className={styles.summaryCard}>
              <div className={styles.cardContent}>
                <div>
                  <h3 className={styles.cardLabel}>Total Meal Orders</h3>
                  <div
                    className={styles.cardValue}
                    style={{ color: "#52c41a" }}
                  >
                    {totalMealOrders}
                  </div>
                  <p className={styles.cardSubtext}>Individual meals served</p>
                </div>
                <div className={`${styles.cardIcon} ${styles.greenBg}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.iconSvg}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a4 4 0 00-3-3.87M9 20h6M3 20h5v-2a4 4 0 013-3.87M12 4a4 4 0 110 8 4 4 0 010-8z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className={styles.summaryCard}>
              <div className={styles.cardContent}>
                <div>
                  <h3 className={styles.cardLabel}>Different Meals</h3>
                  <div
                    className={styles.cardValue}
                    style={{ color: "#fa541c" }}
                  >
                    {mealOrderData.length}
                  </div>
                  <p className={styles.cardSubtext}>Unique meal varieties</p>
                </div>
                <div className={`${styles.cardIcon} ${styles.orangeBg}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.iconSvg}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3-1.343-3-3a3 3 0 116 0c0 1.657-1.343 3-3 3zm0 2c2.761 0 5 1.567 5 3.5V18H7v-4.5C7 11.567 9.239 10 12 10z"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;
