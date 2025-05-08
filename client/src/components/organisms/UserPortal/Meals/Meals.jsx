import React, { useState, useEffect } from "react";
import { Card, List, Button, Typography, Divider, Tabs as AntTabs, Calendar, Modal, message, Tabs } from "antd";
import { useAuth } from "../../../../contexts/AuthContext";
import axios from "axios";

// Destructuring Typography components for cleaner code
const { Text, Title } = Typography;
const { TabPane } = Tabs;

// Cart component to display individual order details
const Cart = ({ order, mealDetails, onCancelOrder, isCancelable }) => {
  return (
    <Card className={styles.cartContainer}>
      {/* Container for cart content */}
      <div className={styles.cartContent}>
        {/* Flex row for order ID and price */}
        <div className={styles.flexRow}>
          <Text strong className={styles.orderTextId}>Order ID: {order.id}</Text>
          <Text strong className={styles.orderText}>LKR {order.price.toFixed(2)}</Text>
        </div>
        {/* Display order date */}
        <div>
          <Text strong>Order Date:</Text> {new Date(order.orderDate).toLocaleDateString()}
        </div>
        {/* Display meal type based on order properties */}
        <div>
          <Text strong>Meal Type:</Text> {order.breakfast ? "Breakfast" : order.lunch ? "Lunch" : "Dinner"}
        </div>
        {/* Display order placement time */}
        <div>
          <Text strong>Ordered At:</Text> {new Date(order.orderPlacedTime).toLocaleString()}
        </div>

        {/* List of meals ordered */}
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

      {/* Button to cancel order, disabled if not cancelable */}
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

// Main Meals component to manage and display orders
const Meals = () => {
  // Access authentication data from context
  const { authData } = useAuth();
  // State for active tab (current or past orders)
  const [activeTab, setActiveTab] = useState("current");
  // State for storing current and past orders
  const [currentOrders, setCurrentOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  // State for storing meal details
  const [mealDetails, setMealDetails] = useState({});
  // State for orders on a selected date
  const [selectedDateOrders, setSelectedDateOrders] = useState([]);
  // State for controlling modal visibility
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Retrieve employee ID from auth data or local storage
  const employeeId = authData?.user?.id || localStorage.getItem("employeeId");

  // Effect to fetch orders and meal details on component mount or employeeId change
  useEffect(() => {
    // Check if employee ID exists
    if (!employeeId) {
      message.error("Employee ID is missing. Please log in again.");
      return;
    }
  
    // Store employee ID in local storage
    localStorage.setItem("employeeId", employeeId);
  
    // Function to fetch orders and meal details
    const fetchOrders = async () => {
      try {
        // Fetch orders for the employee
        const response = await axios.get(`http://localhost:3000/orders?employeeId=${employeeId}`);
        const orders = response.data;
  
        // Get today's date for filtering
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to the start of the day
  
        // Filter current orders (not served and from today or later)
        const current = orders.filter((order) => {
          const orderDate = new Date(order.orderDate);
          return (
            order.employeeId === employeeId &&
            order.serve === false &&
            orderDate >= today
          );
        });
  
        // Filter past orders (served)
        const past = orders.filter((order) => order.employeeId === employeeId && order.serve === true);
  
        // Extract unique meal IDs from orders
        const mealIdCounts = orders.flatMap((order) =>
          Object.entries(order.meals || {}).map(([mealId, count]) => ({
            mealId,
            count,
          }))
        );
  
        const uniqueMealIds = [...new Set(mealIdCounts.map((item) => item.mealId))];
  
        // Fetch meal details for unique meal IDs
        const mealResponses = await Promise.all(
          uniqueMealIds.map((mealId) =>
            axios
              .get(`http://localhost:3000/meal/${mealId}`)
              .then((response) => response.data)
              .catch(() => null)
          )
        );
  
        // Create meal details map
        const mealDetailsMap = {};
        mealResponses.forEach((meal) => {
          if (meal) {
            mealDetailsMap[meal.id] = meal.nameEnglish;
          }
        });
  
        // Update state with fetched data
        setMealDetails(mealDetailsMap);
        setCurrentOrders(current);
        setPastOrders(past);
      } catch (error) {
        // Handle errors during fetch
        message.error("Failed to fetch orders or meal details. Please try again.");
      }
    };
  
    fetchOrders();
  }, [employeeId]);

  // Function to handle order cancellation
  const handleCancelOrder = async (orderId) => {
    try {
      // Send delete request to cancel order
      await axios.delete(`http://localhost:3000/orders/${orderId}`);
      message.success("Order canceled successfully.");
      // Update current orders state
      setCurrentOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (error) {
      // Handle cancellation errors
      message.error("Failed to cancel the order. Please try again.");
    }
  };

  // Function to determine if an order is cancelable
  const isCancelable = (order) => {
    const now = new Date();
    const orderDate = new Date(order.orderDate);

    // Check if order is in the future or today
    if (
      orderDate.getFullYear() > now.getFullYear() ||
      (orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() > now.getMonth()) ||
      (orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getDate() >= now.getDate())
    ) {
      const currentTime = now.getHours() * 60 + now.getMinutes();

      // Check time-based cancellation rules for same-day orders
      if (orderDate.getDate() === now.getDate()) {
        if (order.breakfast && currentTime < 540) return true; // Before 9:00 AM
        if (order.lunch && currentTime < 660) return true; // Before 11:00 AM
        if (order.dinner && currentTime < 1080) return true; // Before 6:00 PM
        return false;
      }

      return true;
    }

    return false;
  };

  // Handle calendar date selection
  const handleDateSelect = (date) => {
    const selectedDate = date.format("YYYY-MM-DD");
    // Filter past orders for the selected date
    const ordersForDate = pastOrders.filter(
      (order) => new Date(order.orderDate).toISOString().split("T")[0] === selectedDate
    );
    setSelectedDateOrders(ordersForDate);
    setIsModalVisible(true);
  };

  // Close the modal and reset selected date orders
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedDateOrders([]);
  };

  // Render the Meals component
  return (
    <div style={{ margin: "20px" }}>
      <Title level={4}>Orders</Title>
      {/* Tabs for switching between current and past orders */}
      <Tabs 
        defaultActiveKey="current"
        tabBarStyle={{ display: "flex", justifyContent: "center" }}
      >
        {/* Current Orders Tab */}
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
                  {/* Cancel button for current orders */}
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

        {/* Past Orders Tab */}
        <TabPane tab="Past Orders" key="past">
          {pastOrders.length > 0 ? (
            <div>
              {/* Calendar for selecting past order dates */}
              <Calendar
                fullscreen={true}
                onSelect={handleDateSelect}
              />
              {/* Modal to display orders for selected date */}
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

// Export the Meals component as default
export default Meals;