import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Button,
  Typography,
  Modal,
  message,
  Tabs,
  Calendar,
  Tag,
} from "antd";
import { useAuth } from "../../../../contexts/AuthContext.jsx";
import axios from "axios";
import styles from "./Meals.module.css";
import { QrcodeOutlined } from "@ant-design/icons";
import Barcode from "react-barcode";

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const Cart = ({
  order,
  mealDetails,
  mealTypes,
  onCancelOrder,
  isCancelable,
  isReadOnly = false,
}) => {
  const [showQR, setShowQR] = useState(false);

  const handleCardClick = () => {
    if (!isReadOnly) {
      setShowQR((prev) => !prev);
    }
  };

  const handleCancelClick = (e) => {
    e.stopPropagation();
    onCancelOrder(order.id);
  };

  // Check if order is not served (future date with serve: false)
  const isNotServed = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(order.orderDate);
    return orderDate < today && order.serve === false;
  };

  return (
    <Card
      className={styles.cartContainer}
      hoverable={!isReadOnly}
      onClick={handleCardClick}
    >
      <div className={styles.cardContent}>
        {!isReadOnly && (
          <div className={styles.cardHeaderMain1}>
            <Text strong className={styles.cardHeaderMain}>
              {showQR ? (
                "  Tap to Show Details  "
              ) : (
                <>
                  Tap to Show Token <QrcodeOutlined />
                </>
              )}
            </Text>
          </div>
        )}
        <br />
        
        <div className={styles.contentArea}>
          {showQR && !isReadOnly ? (
            <div className={styles.qrContainer}>
              <Barcode value={order.id.toString()} width={2} height={80} displayValue={true} />
            </div>
          ) : (
            <>
              {isNotServed() && (
                  <Tag color="error" style={{ marginLeft: '8px', fontSize: '10px' }}>
                    Not Served
                  </Tag>
                )}
                <br />
              <div className={styles.orderedAt}>
                <Text style={{ fontSize: "10px" }}>
                  {new Date(order.orderPlacedTime).toLocaleString()}
                </Text>
              </div>
              
              <div className={styles.cardHeader}>
                <Text strong className={styles.orderId}>
                  ID: {order.id}
                </Text>
                <Text strong className={styles.orderPrice}>
                  LKR {order.price.toFixed(2)}
                </Text>
                
              </div>
              <div className={styles.orderDetailsContainer}>
                <div className={styles.orderDetails}>
                  <Text
                    strong
                    className={styles.mealType}
                    style={{ float: "left" }}
                  >
                    {mealTypes[order.mealTypeId] || `Meal Type ${order.mealTypeId}`}
                  </Text>
                  <Text
                    strong
                    className={styles.orderDate}
                    style={{ float: "right" }}
                  >
                    {new Date(order.orderDate).toLocaleDateString()}
                  </Text>
                </div>
                <div className={styles.mealsOrdered}>
                  <List
                    itemLayout="horizontal"
                    dataSource={order.meals.map((meal) => {
                      const [mealId, count] = meal.split(":");
                      return {
                        name: mealDetails[mealId] || "Unknown Meal",
                        quantity: count,
                      };
                    })}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={<div style={{ float: "left" }}>{item.name}</div>}
                        />
                        <List.Item.Meta
                          title={
                            <div style={{ float: "right" }}>{item.quantity}</div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {!isReadOnly && (
        <div className={styles.buttonContainer}>
          <Button
            type="primary"
            danger
            block
            className={styles.cancelButton}
            onClick={handleCancelClick}
            disabled={!isCancelable(order)}
          >
            Cancel Order
          </Button>
        </div>
      )}
    </Card>
  );
};

const Meals = () => {
  const { authData } = useAuth();
  const [activeTab, setActiveTab] = useState("current");
  const [currentOrders, setCurrentOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [mealDetails, setMealDetails] = useState({});
  const [mealTypes, setMealTypes] = useState({});
  const [selectedDateOrders, setSelectedDateOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const token = authData?.accessToken;

  const employeeId = authData?.user?.id || localStorage.getItem("employeeId");

  useEffect(() => {
    if (!employeeId) {
      message.error("Employee ID is missing. Please log in again.");
      return;
    }

    localStorage.setItem("employeeId", employeeId);

    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/orders?employeeId=${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const orders = response.data;

        const mealIdCounts = orders.flatMap((order) =>
          order.meals.map((meal) => {
            const [mealId, count] = meal.split(":");
            return { mealId: parseInt(mealId), count: parseInt(count) };
          })
        );

        const uniqueMealIds = [
          ...new Set(mealIdCounts.map((item) => item.mealId)),
        ];

        const mealResponses = await Promise.all(
          uniqueMealIds.map((mealId) =>
            axios
              .get(`http://localhost:3000/meal/${mealId}`)
              .then((response) => response.data)
              .catch(() => null)
          )
        );

        const mealDetailsMap = {};
        const mealTypeMap = {};
        
        mealResponses.forEach((meal) => {
          if (meal) {
            mealDetailsMap[meal.id] = meal.nameEnglish;
          }
        });

        // Fetch meal types
        const uniqueMealTypeIds = [...new Set(orders.map(order => order.mealTypeId))];
        
        const mealTypeResponses = await Promise.all(
          uniqueMealTypeIds.map((mealTypeId) =>
            axios
              .get(`http://localhost:3000/meal-type/${mealTypeId}`)
              .then((response) => response.data)
              .catch(() => null)
          )
        );

        mealTypeResponses.forEach((mealType) => {
          if (mealType) {
            mealTypeMap[mealType.id] = mealType.name;
          }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const current = orders.filter((order) => {
          const orderDate = new Date(order.orderDate);
          return (
            order.employeeId === employeeId &&
            order.serve === false &&
            orderDate >= today
          );
        });

        const past = orders.filter((order) => {
          const orderDate = new Date(order.orderDate);
          return (
            order.employeeId === employeeId && 
            (order.serve === true || (order.serve === false && orderDate < today))
          );
        });

        setMealDetails(mealDetailsMap);
        setMealTypes(mealTypeMap);
        setCurrentOrders(current);
        setPastOrders(past);
      } catch (error) {
        message.error(
          "Failed to fetch orders or meal details. Please try again."
        );
      }
    };

    fetchOrders();
  }, [employeeId]);

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:3000/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("Order canceled successfully.");
      setCurrentOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (error) {
      message.error("Failed to cancel the order. Please try again.");
    }
  };

  const isCancelable = (order) => {
    const now = new Date();
    const orderDate = new Date(order.orderDate);

    if (
      orderDate.getFullYear() > now.getFullYear() ||
      (orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() > now.getMonth()) ||
      (orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getDate() >= now.getDate())
    ) {
      const currentTime = now.getHours() * 60 + now.getMinutes();

      if (orderDate.getDate() === now.getDate()) {
        const mealTypeName = mealTypes[order.mealTypeId]?.toLowerCase() || '';
        
        if (mealTypeName.includes('breakfast') && currentTime < 540) return true; // 9:00 AM
        if (mealTypeName.includes('lunch') && currentTime < 660) return true; // 11:00 AM
        if (mealTypeName.includes('dinner') && currentTime < 1080) return true; // 6:00 PM
        return false;
      }

      return true;
    }

    return false;
  };

  const handleDateSelect = (date) => {
    const selectedDate = date.format("YYYY-MM-DD");
    const ordersForDate = pastOrders.filter(
      (order) =>
        new Date(order.orderDate).toISOString().split("T")[0] === selectedDate
    );
    setSelectedDateOrders(ordersForDate);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedDateOrders([]);
  };

  return (
    <div className={styles.container}>
      <Title level={3} className={styles.title}>
        Your Orders
      </Title>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        className={styles.tabs}
        tabBarStyle={{ marginBottom: 24 }}
      >
        <TabPane tab="Current Orders" key="current">
          {currentOrders.length > 0 ? (
            <div className={styles.orderGrid}>
              {currentOrders.map((order) => (
                <Cart
                  key={order.id}
                  order={order}
                  mealDetails={mealDetails}
                  mealTypes={mealTypes}
                  onCancelOrder={handleCancelOrder}
                  isCancelable={isCancelable}
                />
              ))}
            </div>
          ) : (
            <Card className={styles.emptyCard}>
              <Title level={4}>No Current Orders</Title>
              <Text>You don't have any active orders.</Text>
            </Card>
          )}
        </TabPane>
        <TabPane tab="Past Orders" key="past">
          {pastOrders.length > 0 ? (
            <div>
              <Calendar
                fullscreen={false}
                onSelect={handleDateSelect}
                className={styles.calendar}
              />
              <Modal
                title="Orders for Selected Date"
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                className={styles.modal}
              >
                {selectedDateOrders.length > 0 ? (
                  selectedDateOrders.map((order) => (
                    <Cart
                      key={order.id}
                      order={order}
                      mealDetails={mealDetails}
                      mealTypes={mealTypes}
                      isReadOnly={true} // Pass the new prop to disable cancel button and QR code
                    />
                  ))
                ) : (
                  <Text>No orders found for this date.</Text>
                )}
              </Modal>
            </div>
          ) : (
            <Card className={styles.emptyCard}>
              <Title level={4}>No Past Orders</Title>
              <Text>You don't have any completed orders.</Text>
            </Card>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Meals;
