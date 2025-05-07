import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Statistic, Button, Typography, Table } from 'antd';
import { Pie, Line, Column } from '@ant-design/plots';
import { ArrowLeftOutlined, LogoutOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './CostAnalysis.module.css';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const urL = import.meta.env.VITE_BASE_URL;
const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const CostAnalysis = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [showDistribution, setShowDistribution] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    try {
      const response = await axios.get(`${urL}/ingredients/stats/monthly`);
      setAnalysisData(response.data);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const exportMonthlyStatistics = () => {
    if (!analysisData) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(`Monthly Statistics Report - ${analysisData.year}`, 14, 15);
    
    // Format data for the table
    const tableData = analysisData.monthlyStatistics.map(item => [
      item.month,
      item.statistics.totalIngredients,
      `Rs. ${item.statistics.totalInventoryValue.toFixed(2)}`,
      `Rs. ${item.statistics.averageValuePerIngredient.toFixed(2)}`,
      `Rs. ${item.statistics.priceRange.highest.toFixed(2)}`,
      `Rs. ${item.statistics.priceRange.lowest.toFixed(2)}`
    ]);

    // Define table headers
    const headers = [
      'Month',
      'Total Ingredients',
      'Total Value',
      'Avg Value/Ingredient',
      'Highest Price',
      'Lowest Price'
    ];

    // Generate the table using autoTable directly
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { top: 20 }
    });

    // Add footer with date
    const date = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${date}`, 14, doc.internal.pageSize.height - 10);

    // Save the PDF
    doc.save(`monthly-statistics-${analysisData.year}.pdf`);
  };

  // Add this new function after the existing exportMonthlyStatistics function
  const exportMonthlyDetails = (monthData) => {
    if (!monthData) return;
  
    const doc = new jsPDF();
    
    // Add title and month
    doc.setFontSize(16);
    doc.text(`Monthly Statistics Report - ${monthData.month} ${analysisData.year}`, 14, 15);
    
    // Add monthly summary
    doc.setFontSize(12);
    doc.text(`Summary:`, 14, 30);
    doc.text(`Total Ingredients: ${monthData.statistics.totalIngredients}`, 14, 40);
    doc.text(`Total Value: Rs. ${monthData.statistics.totalInventoryValue.toFixed(2)}`, 14, 47);
    doc.text(`Average Value/Ingredient: Rs. ${monthData.statistics.averageValuePerIngredient.toFixed(2)}`, 14, 54);
    
    // Format ingredients data for the table
    const ingredientsData = monthData.ingredients.map(item => [
      item.name,
      item.type,
      `Rs. ${item.price}`,
      item.quantity,
      item.priority,
      `Rs. ${item.totalValue}`
    ]);
  
    // Define table headers
    const headers = [
      'Name',
      'Type',
      'Price',
      'Quantity',
      'Priority',
      'Total Value'
    ];
  
    // Generate the ingredients table
    autoTable(doc, {
      head: [headers],
      body: ingredientsData,
      startY: 65,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { top: 20 }
    });
  
    // Add footer with date
    const date = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${date}`, 14, doc.internal.pageSize.height - 10);
  
    // Save the PDF
    doc.save(`${monthData.month}-${analysisData.year}-statistics.pdf`);
  };

  const monthlyColumns = [
    { 
      title: 'Month', 
      dataIndex: 'month', 
      key: 'month' 
    },
    { 
      title: 'Total Ingredients', 
      dataIndex: ['statistics', 'totalIngredients'], 
      key: 'totalIngredients' 
    },
    { 
      title: 'Total Value', 
      dataIndex: ['statistics', 'totalInventoryValue'], 
      key: 'totalValue',
      render: (value) => `Rs. ${value.toFixed(2)}` 
    },
    { 
      title: 'Avg Value/Ingredient', 
      dataIndex: ['statistics', 'averageValuePerIngredient'], 
      key: 'average',
      render: (value) => `Rs. ${value.toFixed(2)}` 
    },
    {
      title: 'Highest Price',
      dataIndex: ['statistics', 'priceRange', 'highest'],
      key: 'highest',
      render: (value) => `Rs. ${value.toFixed(2)}`
    },
    {
      title: 'Lowest Price',
      dataIndex: ['statistics', 'priceRange', 'lowest'],
      key: 'lowest',
      render: (value) => `Rs. ${value.toFixed(2)}`
    }
  ];

  const detailColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (value) => `Rs. ${value}` },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Priority', dataIndex: 'priority', key: 'priority' },
    { title: 'Total Value', dataIndex: 'totalValue', key: 'totalValue', render: (value) => `Rs. ${value}` }
  ];

  return (
    <Layout className="min-h-screen">
      <Header className={styles.header}>
        <Row justify="space-between" align="middle">
          <Col>
            <div className="flex items-center">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
                className={styles.backButton}
              >
                Back
              </Button>
              <Title level={4} className={styles.headerTitle}>Cost Analysis Dashboard</Title>
            </div>
          </Col>
          <Col>
            <Button 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Logout
            </Button>
          </Col>
        </Row>
      </Header>

      <Content className={styles.contentSection}>
        {analysisData && (
          <>
            <Card className={styles.yearHeader}>
              <Title level={3}>Year {analysisData.year} Analysis</Title>
            </Card>

            {/* Summary Cards */}
            <Row gutter={[16, 16]} className={styles.summaryCards}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Yearly Ingredients"
                    value={analysisData.totalYearlyIngredients}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Value"
                    value={analysisData.summary.totalValue}
                    prefix="Rs. "
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Most Active Month"
                    value={analysisData.summary.mostActiveMonth}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Avg Monthly Ingredients"
                    value={analysisData.summary.averageMonthlyIngredients}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} xl={12}>
                <Card title="Monthly Cost Trend" className={styles.chartCard}>
                  <Line
                    className={styles.trendChart}
                    data={analysisData.monthlyStatistics.map(stat => ({
                      month: stat.month,
                      value: stat.statistics.totalInventoryValue
                    }))}
                    xField="month"
                    yField="value"
                    point={{
                      size: 5,
                      shape: 'diamond'
                    }}
                    label={{
                      style: {
                        fill: '#aaa'
                      }
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} xl={12}>
                <Card title="Monthly Ingredient Distribution" className={styles.chartCard}>
                  <Column
                    className={styles.trendChart}
                    data={analysisData.monthlyStatistics.map(stat => ({
                      month: stat.month,
                      count: stat.statistics.totalIngredients
                    }))}
                    xField="month"
                    yField="count"
                    label={{
                      position: 'middle',
                      style: {
                        fill: '#FFFFFF',
                        opacity: 0.6
                      }
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Monthly Statistics Table */}
            <Card 
              title="Monthly Statistics" 
              className={`${styles.card} ${styles.tableCard}`}
              extra={
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={exportMonthlyStatistics}
                >
                  Export PDF
                </Button>
              }
            >
              <Table
                dataSource={analysisData.monthlyStatistics}
                columns={monthlyColumns}
                rowKey="month"
                expandable={{
                  expandedRowRender: (record) => (
                    <Card 
                      title="Monthly Ingredients Detail"
                      extra={
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => exportMonthlyDetails(record)}
                        >
                          Export Month Details
                        </Button>
                      }
                    >
                      <Table
                        dataSource={record.ingredients}
                        columns={detailColumns}
                        rowKey="id"
                        pagination={false}
                      />
                    </Card>
                  ),
                }}
              />
            </Card>

            {/* Type and Priority Distribution */}
            {analysisData.monthlyStatistics.map((month) => {
              if (month.statistics.totalIngredients > 0) {
                return (
                  <Card 
                    key={month.month} 
                    title={
                      <div className="flex justify-between items-center">
                        <span>{month.month} Distribution</span>
                        <Button
                          type="link"
                          onClick={() => setShowDistribution(prev => ({
                            ...prev,
                            [month.month]: !prev[month.month]
                          }))}
                        >
                          {showDistribution[month.month] ? 'Hide' : 'View'} Distribution
                        </Button>
                      </div>
                    } 
                    className={styles.chartCard}
                  >
                    {showDistribution[month.month] && (
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Card title="Type Distribution" className={styles.card}>
                            <div className={styles.pieChartContainer}>
                              <Pie
                                data={Object.entries(month.statistics.typeDistribution).map(([type, count]) => ({
                                  type,
                                  value: count
                                }))}
                                angleField="value"
                                colorField="type"
                                radius={0.8}
                                label={{
                                  type: 'outer',
                                  content: '{name} {percentage}'
                                }}
                                interactions={[{ type: 'element-active' }]}
                              />
                            </div>
                          </Card>
                        </Col>
                        <Col xs={24} md={12}>
                          <Card title="Priority Distribution" className={styles.card}>
                            <div className={styles.pieChartContainer}>
                              <Pie
                                data={Object.entries(month.statistics.priorityDistribution).map(([priority, count]) => ({
                                  priority: `Priority ${priority}`,
                                  value: count
                                }))}
                                angleField="value"
                                colorField="priority"
                                radius={0.8}
                                label={{
                                  type: 'outer',
                                  content: '{name} {percentage}'
                                }}
                                interactions={[{ type: 'element-active' }]}
                              />
                            </div>
                          </Card>
                        </Col>
                      </Row>
                    )}
                  </Card>
                );
              }
              return null;
            })}

            {/* Last Updated */}
            <Text type="secondary" className="block mt-4">
              Last Updated: {new Date(analysisData.lastUpdated).toLocaleString()}
            </Text>
          </>
        )}
      </Content>

      <Footer className={`${styles.footer} bg-white`}>
        <Title level={5} className={styles.footerTitle}>Inventory Management System</Title>
        <Text type="secondary" className={styles.footerText}>Efficiently manage your inventory and track costs</Text>
      </Footer>
    </Layout>
  );
};

export default CostAnalysis;