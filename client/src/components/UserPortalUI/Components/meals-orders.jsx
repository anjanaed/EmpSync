import React, { useState, useEffect, useContext } from "react";
import { Card, Tabs, Badge, Button, Modal, Typography, List, Avatar, message } from "antd";
import { ClockCircleOutlined, CheckOutlined, CoffeeOutlined } from "@ant-design/icons";
import { UserContext } from "../../../contexts/UserContext";
import axios from "axios";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

export function MealsOrders() {
  const [currentOrders, setCurrentOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const userData = useContext(UserContext); // Access user data from UserContext

  // Fetch orders relative to the user ID
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userData?.id) {
        message.error("User ID is missing. Unable to fetch orders.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/orders?employeeId=${userData.id}`);
        const orders = response.data;

        // Filter orders that match the employee ID
        const filteredOrders = orders.filter((order) => order.employeeId === userData.id);

        // Log the filtered order IDs to the console
        console.log("Filtered Order IDs for user:", filteredOrders.map((order) => order.id));

        // Separate current and past orders
        const current = filteredOrders.filter((order) => order.status === "In Progress");
        const past = filteredOrders.filter((order) => order.status === "Completed");

        setCurrentOrders(current);
        setPastOrders(past);
      } catch (error) {
        console.error("Failed to fetch orders:", error.message);
        message.error("Failed to fetch orders. Please try again.");
      }
    };

    fetchOrders();
  }, [userData]);

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  return (
    <Tabs defaultActiveKey="current">
      <TabPane tab="Current Orders" key="current">
        {currentOrders.length > 0 ? (
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {currentOrders.map((order) => (
              <Card
                key={order.id}
                title={order.name}
                extra={<Badge status="processing" text={order.status} />}
                style={{ width: 300 }}
              >
                <p>
                  <ClockCircleOutlined /> Ordered at: {order.orderTime}
                </p>
                <p>
                  <CoffeeOutlined /> Estimated delivery: {order.estimatedDelivery}
                </p>
                <p>
                  <strong>Price:</strong> ${order.price.toFixed(2)}
                </p>
                <Button type="link" onClick={() => showOrderDetails(order)}>
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Title level={4}>No Current Orders</Title>
            <Text>You don't have any active meal orders.</Text>
          </Card>
        )}
      </TabPane>

      <TabPane tab="Past Orders" key="past">
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {pastOrders.map((order) => (
            <Card
              key={order.id}
              title={order.name}
              extra={<Badge status="success" text={order.status} />}
              style={{ width: 300 }}
            >
              <p>
                <ClockCircleOutlined /> Ordered at: {order.orderTime}
              </p>
              <p>
                <CheckOutlined /> Delivered at: {order.deliveryTime}
              </p>
              <p>
                <strong>Price:</strong> ${order.price.toFixed(2)}
              </p>
              <Button type="link" onClick={() => showOrderDetails(order)}>
                View Details
              </Button>
            </Card>
          ))}
        </div>
      </TabPane>

      <Modal
        title={selectedOrder?.name}
        visible={isModalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
        ]}
      >
        {selectedOrder && (
          <div>
            <Title level={5}>Ingredients:</Title>
            <List
              dataSource={selectedOrder.ingredients}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
            <Title level={5} style={{ marginTop: "16px" }}>
              Nutritional Information:
            </Title>
            <p>Calories: {selectedOrder.nutritionalInfo.calories}</p>
            <p>Protein: {selectedOrder.nutritionalInfo.protein}g</p>
            <p>Carbs: {selectedOrder.nutritionalInfo.carbs}g</p>
            <p>Fat: {selectedOrder.nutritionalInfo.fat}g</p>
          </div>
        )}
      </Modal>
    </Tabs>
  );
}