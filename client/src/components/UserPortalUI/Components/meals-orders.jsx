import React, { useState, useEffect, useContext } from "react";
import { Card, Tabs, Typography, message, Button, Calendar, Modal } from "antd"; // Import Calendar and Modal from antd
import { UserContext } from "../../../contexts/UserContext";
import axios from "axios";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

export function MealsOrders() {
  const [currentOrders, setCurrentOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [mealDetails, setMealDetails] = useState({});
  const [selectedDateOrders, setSelectedDateOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const userData = useContext(UserContext);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userData?.id) {
        message.error("User ID is missing. Unable to fetch orders.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/orders?employeeId=${userData.id}`);
        const orders = response.data;

        const current = orders.filter((order) => order.employeeId === userData.id && order.serve === false);
        const past = orders.filter((order) => order.employeeId === userData.id && order.serve === true);

        const mealIdCounts = orders.flatMap((order) =>
          Object.entries(order.meals || {}).map(([mealId, count]) => {
            const [parsedMealId, parsedCount] = count.toString().split(":");
            return { mealId: parsedMealId, count: parsedCount };
          })
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
  }, [userData]);

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

    // Check if the order date is today or in the future
    if (
      orderDate.getFullYear() > now.getFullYear() ||
      (orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() > now.getMonth()) ||
      (orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getDate() >= now.getDate())
    ) {
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
      console.log("Current Time in Minutes:", currentTime);
      console.log("Current Date:", now.toLocaleDateString());

      // Allow cancellation for future dates or based on time for today's orders
      if (orderDate.getDate() === now.getDate()) {
        if (order.breakfast && currentTime < 540) return true; // Before 9:00 AM (540 minutes)
        if (order.lunch && currentTime < 660) return true; // Before 11:00 AM (660 minutes)
        if (order.dinner && currentTime < 1080) return true; // Before 6:00 PM (1080 minutes)
        return false; // Not cancelable if the time has passed for today's order
      }

      // For future dates, allow cancellation
      return true;
    }

    return false; // Not cancelable for past dates
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
      <Title level={4}>Orders</Title>
      <Tabs defaultActiveKey="current">
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
                    disabled={!isCancelable(order)} // Disable button if not cancelable
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
                onSelect={handleDateSelect} // Handle date selection
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
}