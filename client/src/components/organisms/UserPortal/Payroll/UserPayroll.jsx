import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Empty, Spin, Input, Select, Space, Button, message } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import PayrollCard from './PayrollCard';
import styles from './UserPayroll.module.css';
import { useAuth } from '../../../../contexts/AuthContext';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const UserPayroll = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null); // Track which card is downloading
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { authData } = useAuth();
  const urL = import.meta.env.VITE_BASE_URL;
  const token = authData?.accessToken;

  // Fetch user's payroll data from backend
  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        console.error('No authentication token available');
        return;
      }

      // Get user's payroll records
      const response = await axios.get(`${urL}/payroll/user/my-payrolls`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.data && response.data.payrolls) {
        // Transform backend data to frontend format
        const transformedData = response.data.payrolls.map((payroll, index) => {
          // Extract month and year from the month field (format: "MM~YYYY" or similar)
          let monthName = 'Unknown';
          let year = new Date().getFullYear();
          
          if (payroll.month) {
            if (payroll.month.includes('~')) {
              const [monthNum, yearStr] = payroll.month.split('~');
              const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ];
              monthName = monthNames[parseInt(monthNum) - 1] || `Month ${monthNum}`;
              year = parseInt(yearStr) || new Date().getFullYear();
            } else {
              // Handle other month formats
              monthName = payroll.month;
            }
          }
          
          // Get available data from backend
          const netPay = parseFloat(payroll.netPay) || 0;
          
          // Since schema only has netPay, we'll estimate gross pay and deductions
          // Using more realistic Sri Lankan payroll calculation estimates
          let estimatedGrossPay, estimatedDeductions;
          
          if (payroll.employee && payroll.employee.salary) {
            // If we have the employee's basic salary, use it for better estimation
            const basicSalary = parseFloat(payroll.employee.salary) || 0;
            // Typical allowances in Sri Lanka: 10-20% of basic salary
            const estimatedAllowances = basicSalary * 0.15; // 15% average allowances
            estimatedGrossPay = basicSalary + estimatedAllowances;
            estimatedDeductions = estimatedGrossPay - netPay;
          } else {
            // Fallback estimation when basic salary is not available
            // Assuming net pay is ~75% of gross pay (25% deductions)
            estimatedGrossPay = netPay / 0.75;
            estimatedDeductions = estimatedGrossPay - netPay;
          }
          
          return {
            id: payroll.id || index,
            month: monthName,
            year: year,
            grossPay: estimatedGrossPay,
            netPay: netPay,
            deductions: estimatedDeductions,
            status: 'processed', // You can add status field to backend if needed
            originalMonth: payroll.month, // Keep original month format for API calls
            // Store actual backend data for reference
            actualNetPay: netPay,
            isEstimated: true, // Flag to indicate these are estimated values
          };
        });

        setPayrollData(transformedData);
      } else {
        setPayrollData([]);
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      
      // More specific error handling
      if (error.response?.status === 401) {
        message.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        message.error('You do not have permission to view payroll data.');
      } else if (error.response?.status === 404) {
        message.info('No payroll records found for your account.');
        setPayrollData([]);
      } else {
        message.error('Failed to load payroll data. Please try again.');
      }
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [token, authData?.employeeId]);

  const handleViewPayroll = async (month, year) => {
    try {
      // Find the payroll record to get the original month format
      const payrollRecord = payrollData.find(p => p.month === month && p.year === year);
      if (!payrollRecord) {
        message.error('Payroll record not found');
        return;
      }

      // Get signed URL for viewing the payroll PDF
      const response = await axios.get(`${urL}/payroll/geturl/by-month/${payrollRecord.originalMonth}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.data && response.data.url) {
        // Open PDF in new tab
        window.open(response.data.url, '_blank');
      } else {
        message.error('Payroll document not available');
      }
    } catch (error) {
      console.error('Error viewing payroll:', error);
      message.error('Failed to view payroll. Please try again.');
    }
  };

  const handleDownloadPayroll = async (month, year) => {
    try {
      // Find the payroll record to get the original month format
      const payrollRecord = payrollData.find(p => p.month === month && p.year === year);
      if (!payrollRecord) {
        message.error('Payroll record not found');
        return;
      }

      // Set downloading state
      setDownloadingId(payrollRecord.id);

      // Use the streaming download endpoint to avoid CORS issues
      const response = await axios.get(`${urL}/payroll/download/stream/by-month/${payrollRecord.originalMonth}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', // Important: Tell axios to expect binary data
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Payroll-${month}-${year}.pdf`;
      link.style.display = 'none';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
      
      message.success('Payroll download completed');
    } catch (error) {
      console.error('Error downloading payroll:', error);
      message.error('Failed to download payroll. Please try again.');
    } finally {
      setDownloadingId(null); // Clear downloading state
    }
  };

  const handleRefresh = () => {
    fetchPayrollData();
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
                  isEstimated={payroll.isEstimated}
                  actualNetPay={payroll.actualNetPay}
                  isDownloading={downloadingId === payroll.id}
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
