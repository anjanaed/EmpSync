import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import './DateTime.css';

const { Text } = Typography;

const DateTime = () => {
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
    <Text className="date-time">
      {formatDateTime(dateTime)}
    </Text>
  );
};

export default DateTime;