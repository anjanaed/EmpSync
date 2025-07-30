import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { PlayCircleOutlined, CodeOutlined } from '@ant-design/icons';
import PayrollCard from '../organisms/UserPortal/Payroll/PayrollCard';
import UserPayroll from '../organisms/UserPortal/Payroll/UserPayroll';
import styles from './PayrollDemo.module.css';

const { Title, Text, Paragraph } = Typography;

const PayrollDemo = () => {
  const handleViewDemo = (month, year) => {
    console.log(`Demo: Viewing payroll for ${month} ${year}`);
    alert(`Demo: Viewing detailed payroll for ${month} ${year}`);
  };

  const handleDownloadDemo = (month, year) => {
    console.log(`Demo: Downloading payroll for ${month} ${year}`);
    alert(`Demo: Downloading payroll PDF for ${month} ${year}`);
  };

  return (
    <div className={styles.demoContainer}>
      <div className={styles.header}>
        <Title level={1}>Payroll Interface Demo</Title>
        <Paragraph className={styles.description}>
          A modern, responsive payroll interface built with Ant Design components.
          Features individual month cards with professional styling and smooth interactions.
        </Paragraph>
      </div>

      <div className={styles.demoSection}>
        <Card className={styles.demoCard}>
          <Title level={3}>
            <PlayCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Live Demo
          </Title>
          <Text>Interactive payroll interface with sample data:</Text>
          <div className={styles.demoWrapper}>
            <UserPayroll />
          </div>
        </Card>
      </div>

      <div className={styles.demoSection}>
        <Card className={styles.demoCard}>
          <Title level={3}>
            <CodeOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
            Individual Card Component
          </Title>
          <Text>Example of a single PayrollCard component:</Text>
          <div className={styles.cardDemo}>
            <div style={{ maxWidth: '400px', margin: '20px auto' }}>
              <PayrollCard
                month="July"
                year={2025}
                grossPay={5500.00}
                netPay={4125.50}
                deductions={1374.50}
                status="processed"
                onView={handleViewDemo}
                onDownload={handleDownloadDemo}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.featureSection}>
        <Title level={3}>Key Features</Title>
        <div className={styles.featureGrid}>
          <Card className={styles.featureCard}>
            <Title level={4}>🎨 Modern Design</Title>
            <Text>Rounded corners, subtle shadows, and clean typography following Apple-inspired design principles.</Text>
          </Card>
          <Card className={styles.featureCard}>
            <Title level={4}>📱 Responsive</Title>
            <Text>Fully responsive layout that adapts to mobile, tablet, and desktop screen sizes.</Text>
          </Card>
          <Card className={styles.featureCard}>
            <Title level={4}>⚡ Interactive</Title>
            <Text>Smooth hover effects, button animations, and intuitive user interactions.</Text>
          </Card>
          <Card className={styles.featureCard}>
            <Title level={4}>🔍 Searchable</Title>
            <Text>Built-in search and filtering capabilities for easy payroll record navigation.</Text>
          </Card>
          <Card className={styles.featureCard}>
            <Title level={4}>🌙 Theme Support</Title>
            <Text>Dark mode support integrated with your existing theme system.</Text>
          </Card>
          <Card className={styles.featureCard}>
            <Title level={4}>♿ Accessible</Title>
            <Text>ARIA labels, keyboard navigation, and screen reader compatibility.</Text>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PayrollDemo;
