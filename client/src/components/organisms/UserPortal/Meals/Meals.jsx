import React from 'react';
import { Card, List, Button, Typography, Divider } from 'antd';
import styles from './Meals.module.css';

const { Title, Text } = Typography;

const Cart = ({ items, onRemove, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Card className={styles.cartContainer} title="Your Cart">
      <div>
        <Text strong>Price:</Text> LKR 300.00
      </div>
      <div>
        <Text strong>Order ID:</Text> 2
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
          <List.Item
            actions={[
              <Button type="link" danger onClick={() => onRemove(item.id)}>
                Remove
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={item.name}
              description={`Quantity: ${item.quantity}`}
            />
            <div>${(item.price * item.quantity).toFixed(2)}</div>
          </List.Item>
        )}
      />

      <Divider />

      <div className={styles.totalSection}>
        <Text strong>Total:</Text>
        <Text strong>${total.toFixed(2)}</Text>
      </div>

      <Button
        type="primary"
        block
        disabled={items.length === 0}
        onClick={onCheckout}
      >
        Checkout
      </Button>

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

export default Cart;
