import React, { useState } from 'react';
import { Card, List, Button, Typography, Divider, Tabs } from 'antd';
import styles from './Meals.module.css';

const { Text } = Typography;

const Cart = ({ items }) => {
  return (
    <Card className={styles.cartContainer}>
      <div className={styles.flexRow}>
        <Text strong className={styles.orderText}>Order ID:</Text> 
        <Text strong className={styles.orderText}>2</Text>
        <Text strong className={`${styles.orderText} ${styles.marginLeftAuto}`}>Total Price:</Text> 
        <Text strong className={styles.orderText}>LKR 470.00</Text>
      </div>
      <div>
        <Text strong>Order Date:</Text> 5/5/2025
      </div>
      <div>
        <Text strong>Meal Type:</Text> Lunch
      </div>
      <div>
        <Text strong>Ordered At:</Text> 5/5/2025 10:05:55AM
      </div>

      <Divider />

      <Text strong>Meals Ordered:</Text>
      <List
        itemLayout="horizontal"
        dataSource={items}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item.name}
              description={`Quantity: ${item.quantity}`}
            />
            <div>${(item.price * item.quantity).toFixed(2)}</div>
          </List.Item>
        )}
      />

      <Divider />

      <Button
        type="default"
        block
        danger
        className={styles.cancelButton}
        onClick={() => console.log('Cancel Order')}
      >
        Cancel Order
      </Button>
    </Card>
  );
};

const Meals = () => {
  const [activeTab, setActiveTab] = useState('current');

  const items = [
    { name: 'Meal 1', quantity: 1, price: 100 },
    { name: 'Meal 2', quantity: 2, price: 150 },
  ];

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <div>
      <Typography.Title level={2} className={styles.title}>
        Meal Order
      </Typography.Title>
      <Tabs
        defaultActiveKey="current"
        onChange={handleTabChange}
        centered
        items={[
          { key: 'current', label: 'Current Order', children: <div className={styles.horizontalContainer}>
            <Cart items={items} />
            <Cart items={items} />
            <Cart items={items} />
            <Cart items={items} />
          </div> },
          { key: 'past', label: 'Past Order', children: <div>No past orders available.</div> },
        ]}
      />
    </div>
  );
};

export default Meals;
