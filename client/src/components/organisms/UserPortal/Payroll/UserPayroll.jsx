import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Empty, Spin, Input, Select, Space, Button } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import PayrollCard from './PayrollCard';
import styles from './UserPayroll.module.css';
import { useAuth } from '../../../../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const UserPayroll = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { authData } = useAuth();

  // Sample data - replace with actual API call
  const samplePayrollData = [
    {
      id: 1,
      month: 'July',
      year: 2025,
      grossPay: 5500.00,
      netPay: 4125.50,
      deductions: 1374.50,
      status: 'processed'
    },
    {
      id: 2,
      month: 'June',
      year: 2025,
      grossPay: 5500.00,
      netPay: 4125.50,
      deductions: 1374.50,
      status: 'processed'
    },
    {
      id: 3,
      month: 'May',
      year: 2025,
      grossPay: 5500.00,
      netPay: 4125.50,
      deductions: 1374.50,
      status: 'processed'
    },
    {
      id: 4,
      month: 'April',
      year: 2025,
      grossPay: 5500.00,
      netPay: 4125.50,
      deductions: 1374.50,
      status: 'pending'
    },
    {
      id: 5,
      month: 'March',
      year: 2025,
      grossPay: 5300.00,
      netPay: 3975.25,
      deductions: 1324.75,
      status: 'processed'
    },
    {
      id: 6,
      month: 'February',
      year: 2025,
      grossPay: 5300.00,
      netPay: 3975.25,
      deductions: 1324.75,
      status: 'processed'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchPayrollData = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPayrollData(samplePayrollData);
      } catch (error) {
        console.error('Error fetching payroll data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, []);

  const handleViewPayroll = (month, year) => {
    console.log(`Viewing payroll for ${month} ${year}`);
    // Navigate to detailed payroll view
    // navigate(`/payroll/details/${year}/${month}`);
  };

  const handleDownloadPayroll = (month, year) => {
    console.log(`Downloading payroll for ${month} ${year}`);
    // Implement download functionality
    // This could trigger a PDF download or API call
  };

  const handleRefresh = () => {
    setLoading(true);
    // Refetch data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Filter data based on search and filters
  const filteredData = payrollData.filter(item => {
    const matchesSearch = item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.year.toString().includes(searchTerm);
    const matchesYear = filterYear === 'all' || item.year.toString() === filterYear;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesYear && matchesStatus;
  });

  // Get unique years for filter
  const availableYears = [...new Set(payrollData.map(item => item.year))].sort((a, b) => b - a);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <Text className={styles.loadingText}>Loading your payroll history...</Text>
      </div>
    );
  }

  return (
    <div className={styles.payrollContainer}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Title level={2} className={styles.pageTitle}>
            My Payroll
          </Title>
          <Text className={styles.subtitle}>
            View and download your monthly payroll statements
          </Text>
        </div>
        <Button
          type="text"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          className={styles.refreshButton}
        >
          Refresh
        </Button>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <Space size="middle" wrap className={styles.filterGroup}>
          <Input
            placeholder="Search by month or year..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            allowClear
          />
          <Select
            placeholder="Filter by year"
            value={filterYear}
            onChange={setFilterYear}
            className={styles.filterSelect}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">All Years</Option>
            {availableYears.map(year => (
              <Option key={year} value={year.toString()}>
                {year}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Filter by status"
            value={filterStatus}
            onChange={setFilterStatus}
            className={styles.filterSelect}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">All Status</Option>
            <Option value="processed">Processed</Option>
            <Option value="pending">Pending</Option>
            <Option value="draft">Draft</Option>
          </Select>
        </Space>
      </div>

      {/* Results Section */}
      {filteredData.length === 0 ? (
        <Empty
          description="No payroll records found"
          className={styles.emptyState}
        />
      ) : (
        <>
          <div className={styles.resultsHeader}>
            <Text className={styles.resultsCount}>
              Showing {filteredData.length} payroll record{filteredData.length !== 1 ? 's' : ''}
            </Text>
          </div>
          
          <Row gutter={[24, 24]} className={styles.cardsGrid}>
            {filteredData.map((payroll) => (
              <Col
                key={payroll.id}
                xs={24}
                sm={24}
                md={12}
                lg={8}
                xl={8}
                xxl={6}
              >
                <PayrollCard
                  month={payroll.month}
                  year={payroll.year}
                  grossPay={payroll.grossPay}
                  netPay={payroll.netPay}
                  deductions={payroll.deductions}
                  status={payroll.status}
                  onView={handleViewPayroll}
                  onDownload={handleDownloadPayroll}
                />
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

export default UserPayroll;
