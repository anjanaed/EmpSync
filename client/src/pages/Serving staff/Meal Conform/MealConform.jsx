import React from "react";
import { Layout, Typography, Card, Button, Space } from 'antd';
import DateTime from "../../../components/Serving/DateAndTime/DateTime";
import mealImage from './image.png';
import additional from './second.png'
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
          <div className="date-time">
            <DateTime color="#5D071C"/>
          </div>
        </div>  
      <Card className="meal-confirmation-card">
        
        <div className="meal-content">
          <div className="meal-image">
            <img 
              src={mealImage}
              alt="Meal" 
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
            <div className="additional-container">
              <img 
                src={additional} 
                alt="Egg" 
                className="additional-image"
              />
            </div>
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
      </Card>
      <div className="meal-actions">
          <Space>
            <Button 
              type="default" 
              onClick={handleCancel}
              size="large"
              style={{ borderColor: '#5D071C' }}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              onClick={handleConfirm}
              size="large"
              style={{ backgroundColor: '#5D071C', borderColor: '#5D071C' }}
            >
              Confirm
            </Button>
          </Space>
        </div>
    </Layout>
  );
};

export default MealConform;