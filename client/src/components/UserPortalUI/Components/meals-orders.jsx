import React, { useState, useEffect, useContext } from "react";
import { Card, Tabs, Typography, message, Button } from "antd";
import { UserContext } from "../../../contexts/UserContext";
import axios from "axios";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

export function MealsOrders() {
  const [currentOrders, setCurrentOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [mealDetails, setMealDetails] = useState({});
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
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {pastOrders.map((order) => (
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
                      <strong>Meal Type:</strong> {order.mealType || "Unknown"}
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
                  <Button type="primary" danger disabled style={{ marginTop: "10px", alignSelf: "center" }}>
                    Cancel Order
                  </Button>
                </Card>
              ))}
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