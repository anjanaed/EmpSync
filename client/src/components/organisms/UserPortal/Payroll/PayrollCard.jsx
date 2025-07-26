import React from 'react';
import { Card, Typography, Button, Row, Col, Space, Divider } from 'antd';
import { EyeOutlined, DownloadOutlined, CreditCardOutlined } from '@ant-design/icons';
import styles from './PayrollCard.module.css';

const { Title, Text } = Typography;

const PayrollCard = ({ 
  month, 
  year, 
  grossPay, 
  netPay, 
  deductions,
  onView, 
  onDownload,
  status = 'processed' 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return '#52c41a';
      case 'pending': return '#faad14';
      case 'draft': return '#d9d9d9';
      default: return '#52c41a';
    }
  };

  return (
    <Card
      className={styles.payrollCard}
      hoverable
      bordered={false}
    >
      {/* Header Section */}
      <div className={styles.cardHeader}>
        <div className={styles.monthSection}>
          <CreditCardOutlined className={styles.monthIcon} />
          <div>
            <Title level={4} className={styles.monthTitle}>
              {month} {year}
            </Title>
            <Text className={styles.statusText}>
              <span 
                className={styles.statusDot}
                style={{ backgroundColor: getStatusColor(status) }}
              />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </div>
        </div>
      </div>

      <Divider className={styles.divider} />

      {/* Payroll Summary */}
      <div className={styles.summarySection}>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <div className={styles.summaryItem}>
              <Text className={styles.summaryLabel}>Gross Pay</Text>
              <Text className={styles.summaryValue}>
                {formatCurrency(grossPay)}
              </Text>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.summaryItem}>
              <Text className={styles.summaryLabel}>Net Pay</Text>
              <Text className={styles.summaryValuePrimary}>
                {formatCurrency(netPay)}
              </Text>
            </div>
          </Col>
          <Col span={24}>
            <div className={styles.summaryItem}>
              <Text className={styles.summaryLabel}>Total Deductions</Text>
              <Text className={styles.summaryValueSecondary}>
                {formatCurrency(deductions)}
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionSection}>
        <Space size="middle" className={styles.buttonGroup}>
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => onView(month, year)}
            className={styles.viewButton}
          >
            View Details
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => onDownload(month, year)}
            className={styles.downloadButton}
          >
            Download
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default PayrollCard;
