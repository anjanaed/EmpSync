import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import './WelcomeSection.css';

const { Title, Text } = Typography;

const WelcomeSection = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="welcome-container">
      <Title level={1} className="welcome-title">
        Welcome to Helix Food Serving
      </Title>
      <Text className="date-time">
        {formatDateTime(dateTime)}
      </Text>
    </div>
  );
};

export default WelcomeSection;