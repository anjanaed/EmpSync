import React, { useState, useEffect } from 'react';
import { Layout, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import WelcomeSection from '../../../organisms/Serving/WelcomeSection/WelcomeSection.jsx';
import MealSection from '../../../organisms/Serving/MealSection/MealSection.jsx';
import ScanSection from '../../../organisms/Serving/ScanSection/ScanSection.jsx';
import './Serving.css';

const { Content } = Layout;

const Serving = () => {
  const [scanning, setScanning] = useState(true); // Start scanning by default
  const navigate = useNavigate();

  const handleScanSuccess = async (orderId) => {
    try {
      if (orderId) {
        setScanning(false); // Stop scanning after success
        console.log('Scanned Order ID:', orderId);
        navigate(`/meal-conform/${orderId}`);
      } else {
        message.error('Invalid order ID');
      }
    } catch (error) {
      message.error('Error processing scan: ' + error.message);
    }
  };

  return (
    <Layout className="app-container">
      <Content className="content-container">
        <Space direction="vertical" size="middle" className="main-content">
          <WelcomeSection />
          <MealSection />
          <ScanSection isScanning={scanning} onScanSuccess={handleScanSuccess} />
        </Space>
      </Content>
    </Layout>
  );
};

export default Serving;
