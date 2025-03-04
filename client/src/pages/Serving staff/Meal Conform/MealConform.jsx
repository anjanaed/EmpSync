import React from "react";
import { Layout, Typography, Card, Button, Space } from 'antd';
import DateTime from "../../../components/Serving/DateAndTime/DateTime";
import './MealConform.css';
  
const MealConform = () => {
    const handleConfirm = () => {
        // Add confirmation logic here
        message.success('Meal confirmed successfully!');
    };
  
    const handleCancel = () => {
        // Add cancellation logic here
        message.info('Meal order cancelled.');
    };
  
    return (
        <Layout className="app-container-conform">
        <div>
          <div className="meal-header">
            <Typography.Title level={3}>Breakfast Meal</Typography.Title>
          </div>
        </div>  
      <Card className="meal-confirmation-card">
        <div className="meal-content">
          <div className="meal-image">
            <img 
              src="/api/placeholder/300/300" 
              alt="Meal" 
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
          </div>
          
          <div className="meal-details">
            <Space direction="vertical" size="middle">
              <Typography.Text>
                <strong>Mr. Saman Kumara</strong> 
              </Typography.Text>
              <Typography.Text>
                <strong>Order ID:</strong> BR001236
              </Typography.Text>
              <Typography.Text>
                <strong>Total Price:</strong> Rs.250.00
              </Typography.Text>
              <Typography.Text>
                <strong>Meal Details:</strong> Rice & Curry, Egg
              </Typography.Text>
            </Space>
          </div>
        </div>

        <div className="meal-actions">
          <Space>
            <Button 
              type="default" 
              onClick={handleCancel}
              size="large"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              onClick={handleConfirm}
              size="large"
            >
              Confirm
            </Button>
          </Space>
        </div>
      </Card>
    </Layout>
  );
};

export default MealConform;