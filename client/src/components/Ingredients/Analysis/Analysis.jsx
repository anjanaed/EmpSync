import React, { useState, useEffect } from "react";
import { Button, Card, Table, Typography, Spin, message, Tooltip, Badge } from "antd";
import { LineChartOutlined, InfoCircleOutlined, UserOutlined, FireOutlined, ClockCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import styles from "./Analysis.module.css";
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const Analysis = () => {
  const navigate = useNavigate();
  const [highCostData, setHighCostData] = useState([]);
  const [lowCostData, setLowCostData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [advancedStats, setAdvancedStats] = useState(null);
  const [highCostPage, setHighCostPage] = useState(1);
  const [lowCostPage, setLowCostPage] = useState(1);
  const pageSize = 5; // Number of items per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats data
        const [statsResponse, advancedStatsResponse] = await Promise.all([
          axios.get("http://localhost:3000/ingredients/stats"),
          axios.get("http://localhost:3000/ingredients/advanced-stats")
        ]);

        setStats(statsResponse.data);
        setAdvancedStats(advancedStatsResponse.data);

        // Process advanced stats to get high and low cost items
        const highCostItems = [];
        const lowCostItems = [];

        Object.entries(advancedStatsResponse.data.statistics).forEach(([priority, data]) => {
          Object.entries(data.types).forEach(([type, typeStats]) => {
            // Create items for highest prices
            highCostItems.push({
              key: `${priority}-${type}-high`,
              name: type,
              quantity: typeStats.count,
              price_per_unit: typeStats.highest,
              priceComparison: {
                priceDifference: ((typeStats.highest - typeStats.lowest) / typeStats.lowest * 100).toFixed(0),
                highestPrice: typeStats.highest,
                lowestPrice: typeStats.lowest,
                totalVariants: typeStats.count
              }
            });

            // Create items for lowest prices
            lowCostItems.push({
              key: `${priority}-${type}-low`,
              name: type,
              quantity: typeStats.count,
              price_per_unit: typeStats.lowest,
              priceComparison: {
                priceDifference: ((typeStats.highest - typeStats.lowest) / typeStats.lowest * 100).toFixed(0),
                highestPrice: typeStats.highest,
                lowestPrice: typeStats.lowest,
                totalVariants: typeStats.count
              }
            });
          });
        });

        // Sort by price
        highCostItems.sort((a, b) => b.price_per_unit - a.price_per_unit);
        lowCostItems.sort((a, b) => a.price_per_unit - b.price_per_unit);

        // Transform to table data format
        const formatData = (data, isHighCost) => {
          return data.map(item => ({
            key: item.key,
            item: item.name,
            quantity: `${item.quantity}`,
            price: `Rs.${item.price_per_unit}.00`,
            priceComparison: item.priceComparison,
            isHighCost
          }));
        };

        setHighCostData(formatData(highCostItems, true));
        setLowCostData(formatData(lowCostItems, false));
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load analysis data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Render statistics cards
  const renderStatisticsCards = () => {
    if (!stats || !advancedStats) return null;

    return (
      <div className={styles.statsContainer}>
        <Card className={`${styles.statsCard} ${styles.totalCard}`}>
          <UserOutlined className={styles.statIcon} />
          <div className={styles.statValue}>{stats.totalCount}</div>
          <div className={styles.statLabel}>Total Ingredients</div>
        </Card>

        <Card className={`${styles.statsCard} ${styles.priority1Card}`}>
          <FireOutlined className={styles.statIcon} />
          <div className={styles.statValue}>{stats.priorityCount["1"] || 0}</div>
          <div className={styles.statLabel}>High Priority</div>
        </Card>

        <Card className={`${styles.statsCard} ${styles.priority2Card}`}>
          <ExclamationCircleOutlined className={styles.statIcon} />
          <div className={styles.statValue}>{stats.priorityCount["2"] || 0}</div>
          <div className={styles.statLabel}>Medium Priority</div>
        </Card>

        <Card className={`${styles.statsCard} ${styles.priority3Card}`}>
          <CheckCircleOutlined className={styles.statIcon} />
          <div className={styles.statValue}>{stats.priorityCount["3"] || 0}</div>
          <div className={styles.statLabel}>Low Priority</div>
        </Card>
      </div>
    );
  };

  // Enhanced table columns with price comparison info
  const highCostColumns = [
    {
      title: "Item",
      dataIndex: "item",
      key: "item",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div className={styles.itemLabel}>
            <Badge color="#f5222d" text={`${record.priceComparison?.priceDifference}% higher than average`} />
          </div>
        </div>
      )
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text, record) => (
        <Tooltip title={`Range: Rs.${record.priceComparison?.lowestPrice} - Rs.${record.priceComparison?.highestPrice}`}>
          <span className={styles.highPrice}>{text} <InfoCircleOutlined className={styles.infoIcon} /></span>
        </Tooltip>
      )
    },
  ];

  const lowCostColumns = [
    {
      title: "Item",
      dataIndex: "item",
      key: "item",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div className={styles.itemLabel}>
            <Badge color="#52c41a" text={`${record.priceComparison?.priceDifference}% lower than average`} />
          </div>
        </div>
      )
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text, record) => (
        <Tooltip title={`Range: Rs.${record.priceComparison?.lowestPrice} - Rs.${record.priceComparison?.highestPrice}`}>
          <span className={styles.lowPrice}>{text} <InfoCircleOutlined className={styles.infoIcon} /></span>
        </Tooltip>
      )
    },
  ];

  // Function to handle viewing detailed analysis
  const handleViewAnalysis = () => {
    navigate('/CostAnalysis');
  };

  return (
    <div className={styles.container}>
      <Title level={3} className={styles.title}>
        Cost Analysis Summary
      </Title>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin size="large" tip="Loading cost analysis..." />
        </div>
      ) : (
        <>
          {renderStatisticsCards()}
          <div className={styles.cardsContainer}>
            {/* High Cost Card */}
            <Card
              title="High Cost Items:"
              className={`${styles.costCard} ${styles.highCostCard}`}
              headStyle={{ background: "white", borderBottom: "none", padding: "16px 16px 0" }}
              bodyStyle={{ padding: "0 16px 16px" }}
              extra={highCostData.length > 0 ? 
                <span className={styles.costInfo}>
                  Highest Price: Rs.{highCostData[0]?.priceComparison?.highestPrice} 
                  <Text type="secondary" className={styles.variantText}>
                    ({highCostData[0]?.priceComparison?.totalVariants} variants)
                  </Text>
                </span> : null}
            >
              <Table
                dataSource={highCostData}
                columns={highCostColumns}
                pagination={{
                  current: highCostPage,
                  pageSize: pageSize,
                  onChange: (page) => setHighCostPage(page),
                  total: highCostData.length,
                  showSizeChanger: false,
                  showTotal: (total) => `Total ${total} items`,
                }}
                className={styles.table}
                rowClassName={(record, index) => (index % 2 === 0 ? styles.evenRow : styles.oddRow)}
                locale={{ emptyText: "No high cost items found" }}
              />
            </Card>

            {/* Low Cost Card */}
            <Card
              title="Low Cost Items:"
              className={`${styles.costCard} ${styles.lowCostCard}`}
              headStyle={{ background: "white", borderBottom: "none", padding: "16px 16px 0" }}
              bodyStyle={{ padding: "0 16px 16px" }}
              extra={lowCostData.length > 0 ? 
                <span className={styles.costInfo}>
                  Lowest Price: Rs.{lowCostData[0]?.priceComparison?.lowestPrice}
                  <Text type="secondary" className={styles.variantText}>
                    ({lowCostData[0]?.priceComparison?.totalVariants} variants)
                  </Text>
                </span> : null}
            >
              <Table
                dataSource={lowCostData}
                columns={lowCostColumns}
                pagination={{
                  current: lowCostPage,
                  pageSize: pageSize,
                  onChange: (page) => setLowCostPage(page),
                  total: lowCostData.length,
                  showSizeChanger: false,
                  showTotal: (total) => `Total ${total} items`,
                }}
                className={styles.table}
                rowClassName={(record, index) => (index % 2 === 0 ? styles.evenRow : styles.oddRow)}
                locale={{ emptyText: "No low cost items found" }}
              />
            </Card>
          </div>

          <div className={styles.buttonContainer}>
            <Button 
              icon={<LineChartOutlined />} 
              className={styles.viewButton}
              onClick={handleViewAnalysis}
            >
              View Cost Analysis
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Analysis;