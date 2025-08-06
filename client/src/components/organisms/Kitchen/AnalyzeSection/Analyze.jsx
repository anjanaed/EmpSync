import React, { useState, useEffect } from "react";
import styles from "./Analyze.module.css";
import axios from "axios";
import { Card, Progress } from "antd";
import { TrendingUp, BarChart3, Users, UtensilsCrossed } from "lucide-react";
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
  }, [token, urL, authData.orgId]); 

  const fetchMealAnalytics = async () => {
    if (!token || !authData.orgId) return;
    
    try {
      setLoading(true);
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
                 Highest Demand Meals
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
            <Card className={`${styles.summaryCard} ${styles.blueCard}`}>
              <div className={styles.cardContent}>
                <div className={styles.cardLeft}>
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
                  <BarChart3 className={styles.iconSvg} />
                </div>
              </div>
            </Card>

            <Card className={`${styles.summaryCard} ${styles.greenCard}`}>
              <div className={styles.cardContent}>
                <div className={styles.cardLeft}>
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
                  <Users className={styles.iconSvg} />
                </div>
              </div>
            </Card>

            <Card className={`${styles.summaryCard} ${styles.orangeCard}`}>
              <div className={styles.cardContent}>
                <div className={styles.cardLeft}>
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
                  <UtensilsCrossed className={styles.iconSvg} />
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