import { Button, Card, Typography, Space, Divider, notification } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './MealConform.module.css';
import mealImage from './images/image.png';
import secondary from './images/second.png';
import DateTime from '../../../organisms/Serving/DateAndTime/DateTime';

const urL = import.meta.env.VITE_BASE_URL;
const { Title, Text } = Typography;

const MealConform = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${urL}/orders/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        const data = await response.json();
        setOrderDetails(data);
      } catch (error) {
        notification.error({
          message: 'Error',
          description: 'Failed to load order details',
          duration: 3,
        });
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleCancel = () => {
    notification.warning({
      message: 'Order Cancelled',
      description: `The meal order ${orderDetails?.orderNumber || id} has been cancelled.`,
      duration: 3,
    });
    navigate('/serving');
  };

  const handleConfirm = async () => {
    try {
      const response = await fetch(`${urL}/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serve: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      notification.success({
        message: 'Order Confirmed',
        description: `The meal order ${orderDetails?.orderNumber || id} has been confirmed successfully.`,
        duration: 3,
      });

      setTimeout(() => {
        navigate('/serving');
      }, 1000);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to confirm order',
        duration: 3,
      });
    }
  };

  if (!orderDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.contentWrapper}>
          <div className={styles.header}>
            <Title level={2} className={styles.title}>Breakfast Meal</Title>
            <Text className={styles.dateText}>
              <DateTime color="#701c33" />
            </Text>
          </div>

          <div className={styles.imageContainer}>
            <div className={styles.mainImage}>
              <img
                src={mealImage}
                alt="Breakfast meal with rice and curry"
                className={styles.foodImage}
              />
            </div>
            <div className={styles.badgeImage}>
              <img
                src={secondary}
                alt="secondary item"
                className={styles.eggImage}
              />
            </div>
          </div>

          <div className={styles.userDetails}>
            <Title level={4} className={styles.userName}>Employee Name: Samankumara</Title>
            <Space>
              <Text type="secondary">OrderID - </Text>
              <Text strong className={styles.orderId}>{orderDetails.orderNumber}</Text>
            </Space>
            <div className={styles.priceContainer}>
              <Text type="secondary">Total Price </Text>
              <Text strong className={styles.price}>Rs.{orderDetails.price.toFixed(2)}</Text>
            </div>

            <div className={styles.mealDetails}>
              <Text type="secondary" className={styles.mealDetailsHeader}>Meal Details</Text>
              <Title level={3} className={styles.mealName}>Rice & Curry</Title>
              <Title level={3} className={styles.mealName}>Egg</Title>
            </div>
          </div>
        </div>

        <Divider className={styles.divider} />

        <div className={styles.buttonContainer}>
          <Button 
            size="large" 
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            size="large"
            className={styles.confirmButton}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default MealConform;