import React, { useState, useEffect } from "react";
import { Card, List, Button, Typography, Divider, Tabs as AntTabs, Calendar, Modal, message, Tabs } from "antd";
import { useAuth } from "../../../../contexts/AuthContext";
import axios from "axios";


const { Text, Title } = Typography;
const { TabPane } = Tabs;

const Cart = ({ order, mealDetails, onCancelOrder, isCancelable }) => {
  return (
    <Card className={styles.cartContainer}>
      <div className={styles.cartContent}>
        <div className={styles.flexRow}>
          <Text strong className={styles.orderTextId}>Order ID: {order.id}</Text>
          <Text strong className={styles.orderText}>LKR {order.price.toFixed(2)}</Text>
        </div>
        <div>
          <Text strong>Order Date:</Text> {new Date(order.orderDate).toLocaleDateString()}
        </div>
        <div>
          <Text strong>Meal Type:</Text> {order.breakfast ? "Breakfast" : order.lunch ? "Lunch" : "Dinner"}
        </div>
        <div>
          <Text strong>Ordered At:</Text> {new Date(order.orderPlacedTime).toLocaleString()}
        </div>




        <div className={styles.MealsOrdered}>
        <List
          itemLayout="horizontal"
          dataSource={Object.entries(order.meals || {}).map(([mealId, count]) => ({
            name: mealDetails[mealId] || "Unknown Meal",
            quantity: count,
          }))}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.name}
                description={`Quantity: ${item.quantity}`}
              />
            </List.Item>
          )}
        />
        </div>

      </div>

      <Button
        type="default"
        block
        danger
        className={styles.cancelButton}
        onClick={() => onCancelOrder(order.id)}
        disabled={!isCancelable(order)}
      >
        Cancel Order
      </Button>
    </Card>
  );
};

const Meals = () => {
  const { authData } = useAuth();
  const [activeTab, setActiveTab] = useState("current");
  const [currentOrders, setCurrentOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [mealDetails, setMealDetails] = useState({});
  const [selectedDateOrders, setSelectedDateOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const employeeId = authData?.user?.id || localStorage.getItem("employeeId");

  useEffect(() => {
    if (!employeeId) {
      message.error("Employee ID is missing. Please log in again.");
      return;
    }

    localStorage.setItem("employeeId", employeeId);

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/orders?employeeId=${employeeId}`);
        const orders = response.data;

        const current = orders.filter((order) => order.employeeId === employeeId && order.serve === false);
        const past = orders.filter((order) => order.employeeId === employeeId && order.serve === true);

        const mealIdCounts = orders.flatMap((order) =>
          Object.entries(order.meals || {}).map(([mealId, count]) => ({
            mealId,
            count,
          }))
        );

        const uniqueMealIds = [...new Set(mealIdCounts.map((item) => item.mealId))];

        const mealResponses = await Promise.all(
          uniqueMealIds.map((mealId) =>
            axios
              .get(`http://localhost:3000/meal/${mealId}`)
              .then((response) => response.data)
              .catch(() => null)
          )
        );

        const mealDetailsMap = {};
        mealResponses.forEach((meal) => {
          if (meal) {
            mealDetailsMap[meal.id] = meal.nameEnglish;
          }
        });

        setMealDetails(mealDetailsMap);
        setCurrentOrders(current);
        setPastOrders(past);
      } catch (error) {
        message.error("Failed to fetch orders or meal details. Please try again.");
      }
    };

    fetchOrders();
  }, [employeeId]);

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:3000/orders/${orderId}`);
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
      (orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() > now.getMonth()) ||
      (orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getDate() >= now.getDate())
    ) {
      const currentTime = now.getHours() * 60 + now.getMinutes();

      if (orderDate.getDate() === now.getDate()) {
        if (order.breakfast && currentTime < 540) return true;
        if (order.lunch && currentTime < 660) return true;
        if (order.dinner && currentTime < 1080) return true;
        return false;
      }

      return true;
    }

    return false;
  };

  const handleDateSelect = (date) => {
    const selectedDate = date.format("YYYY-MM-DD");
    const ordersForDate = pastOrders.filter(
      (order) => new Date(order.orderDate).toISOString().split("T")[0] === selectedDate
    );
    setSelectedDateOrders(ordersForDate);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedDateOrders([]);
  };

  return (
    <div style={{ margin: "20px" }}>
      <div style={{ textAlign: "center" }}>
        <Title level={4}>Orders</Title>
      </div>
      <Tabs 
        defaultActiveKey="current"
        tabBarStyle={{ display: "flex", justifyContent: "center" }}
      >
        <TabPane tab="Current Orders" key="current">
          {currentOrders.length > 0 ? (
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {currentOrders.map((order) => (
                <Card
                  key={order.id}
                  extra={`Order ID: ${order.id}`}
                  title={`LKR ${order.price.toFixed(2)}`}
                  style={{ width: 300, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                  bodyStyle={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
                >
                  <div style={{ flexGrow: 1 }}>
                    <p>
                      <strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Meal Type:</strong>{" "}
                      {order.breakfast
                        ? "Breakfast"
                        : order.lunch
                        ? "Lunch"
                        : order.dinner
                        ? "Dinner"
                        : "Unknown"}
                    </p>
                    <p>
                      <strong>Ordered At:</strong>{" "}
                      {new Date(order.orderPlacedTime).toLocaleDateString()}{" "}
                      {new Date(order.orderPlacedTime).toLocaleTimeString()}
                    </p>
                    <p>
                      <strong>Meals Ordered:</strong>
                    </p>
                    <ul>
                      {Object.entries(order.meals || {}).map(([mealId, count]) => {
                        const [parsedMealId, parsedCount] = count.toString().split(":");
                        return (
                          <li key={mealId}>
                            {mealDetails[parsedMealId] || "Unknown Meal"}: {parsedCount}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <Button
                    type="primary"
                    danger
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={!isCancelable(order)}
                    style={{ marginTop: "10px", alignSelf: "center" }}
                  >
                    Cancel Order
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <Title level={4}>No Current Orders</Title>
              <Text>You don't have any active orders.</Text>
            </Card>
          )}
        </TabPane>

        <TabPane tab="Past Orders" key="past">
          {pastOrders.length > 0 ? (
            <div>
              <Calendar
                fullscreen={true}
                onSelect={handleDateSelect}
              />
              <Modal
                title="Orders for Selected Date"
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
              >
                {selectedDateOrders.length > 0 ? (
                  selectedDateOrders.map((order) => (
                    <Card
                      key={order.id}
                      extra={`Order ID: ${order.id}`}
                      title={`LKR ${order.price.toFixed(2)}`}
                      style={{ marginBottom: "16px" }}
                    >
                      <p>
                        <strong>Meal Type:</strong>{" "}
                        {order.breakfast
                          ? "Breakfast"
                          : order.lunch
                          ? "Lunch"
                          : order.dinner
                          ? "Dinner"
                          : "Unknown"}
                      </p>
                      <p>
                        <strong>Ordered At:</strong>{" "}
                        {new Date(order.orderPlacedTime).toLocaleDateString()}{" "}
                        {new Date(order.orderPlacedTime).toLocaleTimeString()}
                      </p>
                      <p>
                        <strong>Meals Ordered:</strong>
                      </p>
                      <ul>
                        {Object.entries(order.meals || {}).map(([mealId, count]) => {
                          const [parsedMealId, parsedCount] = count.toString().split(":");
                          return (
                            <li key={mealId}>
                              {mealDetails[parsedMealId] || "Unknown Meal"}: {parsedCount}
                            </li>
                          );
                        })}
                      </ul>
                    </Card>
                  ))
                ) : (
                  <Text>No orders found for this date.</Text>
                )}
              </Modal>
            </div>
          ) : (
            <Card>
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
