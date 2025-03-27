import React, { useState, useEffect } from 'react';
import { Layout, Typography, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Serving/Header/Header';
import WelcomeSection from '../../../components/Serving/WelcomeSection/WelcomeSection';
import MealSection from '../../../components/Serving/MealSection/MealSection';
import ScanSection from '../../../components/Serving/ScanSection/ScanSection';
import axios from 'axios';
import './Serving.css';


const { Content } = Layout;

const Serving = () => {
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  try {
    const handleScanSuccess = async (orderId) => {
      if (!orderId) {
        navigate(`/Serving/order/${orderId}`);
      } else {
        message.error('Invalid order ID');
      }
    };
  } catch (error) {
    message.error('Error processing scan: ' + error.message);
  };
  
  // Start scanning when component mounts
  useEffect(() => {
    const startScanning = () => {
      setScanning(true);
      // Add event listener for barcode scanner
      document.addEventListener('keydown', handleBarcodeInput);
  };

  let barcodeBuffer = '';
  let lastKeyTime = 0;

  const handleBarcodeInput = (event) => {
    const currentTime = new Date().getTime();
      
    // Reset buffer if too much time has passed between keystrokes
    if (currentTime - lastKeyTime > 100) {
      barcodeBuffer = '';
    }
      
    // Update last key time
    lastKeyTime = currentTime;

     // Handle Enter key (barcode scanner typically ends with Enter)
     if (event.key === 'Enter') {
      if (barcodeBuffer) {
        handleScanSuccess(barcodeBuffer);
        barcodeBuffer = '';
      }
    } else {
      // Add character to buffer
      barcodeBuffer += event.key;
    }
  };

  startScanning();

  // Cleanup
  return () => {
    document.removeEventListener('keydown', handleBarcodeInput);
    setScanning(false);
  };
}, [navigate]);

  return (
    <Layout className="app-container">
      <Content className="content-container">
        <Space direction="vertical" size="medium" className="main-content">
          <Header />
          <WelcomeSection />
          <MealSection />
          <ScanSection isScanning={scanning} />
        </Space>
      </Content>
    </Layout>
  );
};

export default Serving;