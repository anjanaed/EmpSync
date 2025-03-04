import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import DateTime from '../DateAndTime/DateTime'
import './WelcomeSection.css';

const { Title, Text } = Typography;

const WelcomeSection = () => {
  return (
    <div className="welcome-container">
      <Title level={1} className="welcome-title">
        Welcome to Helix Food Serving
      </Title>
      <DateTime className="date-time"/>
    </div>
  );
};

export default WelcomeSection;