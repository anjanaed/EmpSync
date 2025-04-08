import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Statistic, Button, Typography, Table } from 'antd';
import { Pie, Line, Column } from '@ant-design/plots';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './CostAnalysis.module.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const CostAnalysis = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/ingredients/stats/monthly');
      setAnalysisData(response.data);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    }
  };

  const handleLogout = () => {
    navigate('/login');
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
      render: (value) => `$${value.toFixed(2)}` 
    },
    { 
      title: 'Avg Value/Ingredient', 
      dataIndex: ['statistics', 'averageValuePerIngredient'], 
      key: 'average',
      render: (value) => `$${value.toFixed(2)}` 
    },
    {
      title: 'Highest Price',
      dataIndex: ['statistics', 'priceRange', 'highest'],
      key: 'highest',
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      title: 'Lowest Price',
      dataIndex: ['statistics', 'priceRange', 'lowest'],
      key: 'lowest',
      render: (value) => `$${value.toFixed(2)}`
    }
  ];

  const detailColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (value) => `$${value}` },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Priority', dataIndex: 'priority', key: 'priority' },
    { title: 'Total Value', dataIndex: 'totalValue', key: 'totalValue', render: (value) => `$${value}` }
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
                    prefix="$"
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
            <Card title="Monthly Statistics" className={`${styles.card} ${styles.tableCard}`}>
              <Table
                dataSource={analysisData.monthlyStatistics}
                columns={monthlyColumns}
                rowKey="month"
                expandable={{
                  expandedRowRender: (record) => (
                    <Card title="Monthly Ingredients Detail">
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
                  <Card key={month.month} title={`${month.month} Distribution`} className={styles.chartCard}>
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

      <Footer className="text-center bg-white">
        <Title level={5}>Inventory Management System</Title>
        <Text type="secondary">Efficiently manage your inventory and track costs</Text>
      </Footer>
    </Layout>
  );
};

export default CostAnalysis;