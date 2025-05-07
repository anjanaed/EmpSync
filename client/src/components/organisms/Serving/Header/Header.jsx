import React from 'react';
import { Typography } from 'antd';
import './Header.css';

const { Text } = Typography;

const Header = () => {
  return (
    <div className="header-container">
      <Text className="greeting-text">
        Good Morning සුභ උදෑසනක් காலை வணக்கம்
      </Text>
    </div>
  );
};

export default Header;