import React from 'react';
import { Card, List, Button, Typography, Divider } from 'antd';
import styles from './Meals.module.css';

const { Text } = Typography;

const Cart = ({ items }) => {
  return (
    <Card className={styles.cartContainer}>
      <div className={styles.flexRow}>
        <Text strong style={{ fontSize: '18px' }}>Order ID:</Text> <Text strong style={{ fontSize: '18px' }}>2</Text>
        <Text strong style={{ marginLeft: 'auto', fontSize: '18px' }}>Total Price:</Text> <Text strong style={{ fontSize: '18px' }}>LKR 470.00</Text>
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
        style={{ marginTop: '10px' }}
        onClick={() => console.log('Cancel Order')}
      >
        Cancel Order
      </Button>
    </Card>
  );
};

const Meals = () => {
  const items = [
    { name: 'Meal 1', quantity: 1, price: 100 },
    { name: 'Meal 2', quantity: 2, price: 150 },
  ];

  return (
    <div className={styles.horizontalContainer}>
      <Cart items={items} />
      <Cart items={items} />
      <Cart items={items} />
      <Cart items={items} />
    </div>
  );
};

export default Meals;
