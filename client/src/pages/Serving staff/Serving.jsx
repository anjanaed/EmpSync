import React from 'react';
import { Layout, Typography, Space } from 'antd';
import Header from '../../components/Serving/Header/Header';
import WelcomeSection from '../../components/Serving/WelcomeSection/WelcomeSection';
import MealSection from '../../components/Serving/MealSection/MealSection';
import ScanSection from '../../components/Serving/ScanSection/ScanSection';
import './Serving.css';

const { Content } = Layout;

const Serving = () => {
  return (
    <Layout className="app-container">
      <Content className="content-container">
        <Space direction="vertical" size="medium" className="main-content">
          <Header />
          <WelcomeSection />
          <MealSection />
          <ScanSection />
        </Space>
      </Content>
    </Layout>
  );
};

export default Serving;