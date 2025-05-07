import React from 'react';
import { Card, List, Button, Typography, Divider } from 'antd';
import styles from './Meals.module.css';

const { Text } = Typography;

const Cart = ({ items }) => {
  return (
    <Card className={styles.cartContainer} title="Total Price LKR 470.00">
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

export default Cart;
