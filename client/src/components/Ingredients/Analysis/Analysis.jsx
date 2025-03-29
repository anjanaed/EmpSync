import React, { useState, useEffect } from "react";
import { Button, Card, Table, Typography, Spin, message, Tooltip, Badge } from "antd";
import { DownloadOutlined, LineChartOutlined, InfoCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import styles from "./Analysis.module.css";

const { Title, Text } = Typography;

const Analysis = () => {
  const [highCostData, setHighCostData] = useState([]);
  const [lowCostData, setLowCostData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch high cost data
        const highCostResponse = await axios.get("http://localhost:3000/ingredients/price/high");
        
        // Fetch low cost data
        const lowCostResponse = await axios.get("http://localhost:3000/ingredients/price/low");
        
        // Transform API response to table data format
        const formatData = (data, isHighCost) => {
          return data.map((item, index) => ({
            key: item.id || String(index + 1),
            item: item.name,
            quantity: `${item.quantity}`,
            price: `Rs.${item.price_per_unit}.00`,
            // Add additional data that might be used for details/tooltips
            priceComparison: item.priceComparison,
            isHighCost: isHighCost
          }));
        };
        
        setHighCostData(formatData(highCostResponse.data, true));
        setLowCostData(formatData(lowCostResponse.data, false));
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load cost analysis data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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

  // Function to handle downloading the report
  const handleDownloadReport = () => {
    message.info("Downloading report...");
    // Implement actual download functionality
  };

  // Function to handle viewing detailed analysis
  const handleViewAnalysis = () => {
    message.info("Redirecting to detailed analysis...");
    // Implement navigation to detailed view
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
                pagination={false}
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
                pagination={false}
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
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              className={styles.downloadButton}
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Analysis;