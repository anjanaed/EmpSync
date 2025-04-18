import React, { useState } from "react";
import { Card, Tabs, Badge, Button, Modal, Typography, List, Avatar } from "antd";
import { ClockCircleOutlined, CheckOutlined, CoffeeOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Mock meal data
const currentOrders = [
  {
    id: "ORD-1234",
    name: "Grilled Chicken Salad",
    type: "Lunch",
    status: "In Progress",
    orderTime: "12:15 PM",
    estimatedDelivery: "12:45 PM",
    price: 8.99,
    ingredients: ["Grilled chicken", "Mixed greens", "Cherry tomatoes", "Cucumber", "Balsamic vinaigrette"],
    nutritionalInfo: {
      calories: 320,
      protein: 28,
      carbs: 12,
      fat: 18,
    },
  },
];

const pastOrders = [
  {
    id: "ORD-1233",
    name: "Vegetable Omelette",
    type: "Breakfast",
    status: "Completed",
    orderTime: "08:30 AM",
    deliveryTime: "08:50 AM",
    price: 6.99,
    date: "April 28, 2023",
    ingredients: ["Eggs", "Bell peppers", "Onions", "Spinach", "Cheddar cheese"],
    nutritionalInfo: {
      calories: 280,
      protein: 18,
      carbs: 8,
      fat: 20,
    },
  },
];

export function MealsOrders() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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