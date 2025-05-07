import React from 'react';
import { Typography, Card } from 'antd';
import Barcode from '../Barcode/Barcode';
import './ScanSection.css';

const { Title } = Typography;

const ScanSection = () => {
  return (
    <Card className="scan-card">
      <Title level={3} className="scan-title">
        Please Scan Your Token
      </Title>
      <div className="barcode-container">
        <Barcode />
      </div>
    </Card>
  );
};

export default ScanSection;