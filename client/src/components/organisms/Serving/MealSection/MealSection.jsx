import React from 'react';
import { Typography } from 'antd';
import './MealSection.css';

const { Title } = Typography;

const MealSection = () => {
  return (
    <div className="meal-container">
      <Title level={2} className="meal-title">
        Breakfast Meal
      </Title>
    </div>
  );
};

export default MealSection;