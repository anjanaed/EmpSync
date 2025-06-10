import React, { useState } from "react";
import { Card, Progress, Table, Tabs, Button, Select } from "antd";
import { BarChart3, FileText, Users, Download, TrendingUp, TrendingDown } from "lucide-react";
import styles from './Report.module.css';

const { TabPane } = Tabs;
const { Option } = Select;

const Report = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [timePeriod, setTimePeriod] = useState("daily");
  const [orderTimePeriod, setOrderTimePeriod] = useState("daily");
  const [employeeTimePeriod, setEmployeeTimePeriod] = useState("daily");
  const [employeeId, setEmployeeId] = useState("");

  // Sample data for employee meal consumption
  const employeeData = [
    {
      key: "1",
      employeeId: "EMP001",
      employeeName: "John Doe",
      breakfast: 15,
      lunch: 20,
      dinner: 18,
      totalMeals: 53
    },
    {
      key: "2",
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      breakfast: 12,
      lunch: 22,
      dinner: 16,
      totalMeals: 50
    },
    {
      key: "3",
      employeeId: "EMP003",
      employeeName: "Mike Johnson",
      breakfast: 18,
      lunch: 19,
      dinner: 20,
      totalMeals: 57
    },
    {
      key: "4",
      employeeId: "EMP004",
      employeeName: "Sarah Wilson",
      breakfast: 10,
      lunch: 25,
      dinner: 14,
      totalMeals: 49
    }
  ];

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 120,
    },
    {
      title: 'Employee Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 180,
    },
    {
      title: 'Breakfast',
      dataIndex: 'breakfast',
      key: 'breakfast',
      width: 100,
      align: 'center',
    },
    {
      title: 'Lunch',
      dataIndex: 'lunch',
      key: 'lunch',
      width: 100,
      align: 'center',
    },
    {
      title: 'Dinner',
      dataIndex: 'dinner',
      key: 'dinner',
      width: 100,
      align: 'center',
    },
    {
      title: 'Total Meals',
      dataIndex: 'totalMeals',
      key: 'totalMeals',
      width: 120,
      align: 'center',
      render: (value) => (
        <span className={styles.totalMealsCell}>
          {value}
        </span>
      ),
    },
  ];

  const highDemandMeals = [
    { name: "Rice & Curry", percentage: 85 },
    { name: "Chicken Biryani", percentage: 78 },
    { name: "Fish Curry", percentage: 72 }
  ];

  const lowDemandMeals = [
    { name: "Plain Rice", percentage: 12 },
    { name: "Vegetable Soup", percentage: 18 },
    { name: "Salad", percentage: 25 }
  ];

  const handleGenerateReport = () => {
    console.log(`Generating ${timePeriod} report...`);
    // Add your report generation logic here
  };

  return (
    <div className={styles.container}>
      {/* Analysis Section */}
      <div className={styles.analysisSection}>
        <div className={styles.sectionHeader}>
          <TrendingUp className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Analysis</h2>
        </div>

        <div className={styles.analysisGrid}>
          <Card 
            title={
              <div className={styles.cardTitle}>
                <TrendingUp className={styles.highDemandIcon} size={18} />
                High Demand Meals
              </div>
            }
            className={styles.card}
          >
            {highDemandMeals.map((meal, index) => (
              <div key={index} className={styles.mealItem}>
                <div className={styles.mealHeader}>
                  <span>{meal.name}</span>
                  <span className={styles.highDemandPercentage}>{meal.percentage}%</span>
                </div>
                <Progress 
                  percent={meal.percentage} 
                  strokeColor="#52c41a"
                  trailColor="#f0f0f0"
                  showInfo={false}
                />
              </div>
            ))}
          </Card>

          <Card 
            title={
              <div className={styles.cardTitle}>
                <TrendingDown className={styles.lowDemandIcon} size={18} />
                Low Demand Meals
              </div>
            }
            className={styles.card}
          >
            {lowDemandMeals.map((meal, index) => (
              <div key={index} className={styles.mealItem}>
                <div className={styles.mealHeader}>
                  <span>{meal.name}</span>
                  <span className={styles.lowDemandPercentage}>{meal.percentage}%</span>
                </div>
                <Progress 
                  percent={meal.percentage} 
                  strokeColor="#ff4d4f"
                  trailColor="#f0f0f0"
                  showInfo={false}
                />
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Reports Section */}
      <div className={styles.reportsSection}>
        <div className={styles.sectionHeader}>
          <FileText className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Reports</h2>
        </div>
      </div>

      <Card className={styles.card}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ marginBottom: '24px' }}
        >
          <TabPane 
            tab={
              <span className={styles.tabPaneTitle}>
                <BarChart3 className={styles.tabIcon16} size={16} />
                Summary Report
              </span>
            } 
            key="summary"
          >
            <div style={{ marginBottom: '24px' }}>
              <div className={styles.tabContentHeader}>
                {/* <BarChart3 className={styles.tabIcon} size={24} /> */}
                <div>
                  <h2 className={styles.tabTitle}>
                    Employee Meal Consumption Summary
                  </h2>
                  <p className={styles.tabDescription}>
                    Overview of meal consumption by employee including meal types and total counts
                  </p>
                </div>
              </div>

              <div className={styles.controlsContainer}>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    Time Period
                  </label>
                  <Select 
                    value={timePeriod} 
                    onChange={setTimePeriod}
                    className={styles.selectInput}
                  >
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="monthly">Monthly</Option>
                    <Option value="custom">Custom Range</Option>
                  </Select>
                </div>
                {timePeriod === 'custom' && (
                  <>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>
                        Start Date
                      </label>
                      <input 
                        type="date"
                        className={styles.dateInput}
                      />
                    </div>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>
                        End Date
                      </label>
                      <input 
                        type="date"
                        className={styles.dateInput}
                      />
                    </div>
                  </>
                )}
                <Button 
                  type="primary" 
                  onClick={handleGenerateReport}
                  className={styles.generateButtonDark}
                >
                  Generate Report
                </Button>
              </div>

              <Table
                columns={columns}
                dataSource={employeeData}
                pagination={false}
                className={styles.table}
                bordered
              />
            </div>
          </TabPane>

          <TabPane 
            tab={
              <span className={styles.tabPaneTitle}>
                <FileText className={styles.tabIcon16} size={16} />
                Order Details
              </span>
            } 
            key="orders"
          >
            <div style={{ marginBottom: '24px' }}>
              <div className={styles.tabContentHeader}>
                {/* <FileText className={styles.tabIcon} size={24} /> */}
                <div>
                  <h2 className={styles.tabTitle}>
                    Order Details Report
                  </h2>
                  <p className={styles.tabDescription}>
                    Detailed analysis of meal orders, serve counts, and efficiency metrics
                  </p>
                </div>
              </div>

              <div className={styles.controlsContainerWrap}>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    Time Period
                  </label>
                  <Select 
                    value={orderTimePeriod} 
                    onChange={setOrderTimePeriod}
                    className={styles.selectInput}
                  >
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="monthly">Monthly</Option>
                    <Option value="custom">Custom Range</Option>
                  </Select>
                </div>
                {orderTimePeriod === 'custom' && (
                  <>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>
                        Start Date
                      </label>
                      <input 
                        type="date"
                        className={styles.dateInput}
                      />
                    </div>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>
                        End Date
                      </label>
                      <input 
                        type="date"
                        className={styles.dateInput}
                      />
                    </div>
                  </>
                )}
                <Button 
                  type="primary" 
                  onClick={() => console.log('Generating order details report...')}
                  className={styles.generateButtonDark}
                >
                  Generate Report
                </Button>
              </div>

              <Table
                columns={[
                  {
                    title: 'Meal Type',
                    dataIndex: 'mealType',
                    key: 'mealType',
                    width: 150,
                  },
                  {
                    title: 'Order Count',
                    dataIndex: 'orderCount',
                    key: 'orderCount',
                    width: 120,
                    align: 'center',
                  },
                  {
                    title: 'Serve Count',
                    dataIndex: 'serveCount',
                    key: 'serveCount',
                    width: 120,
                    align: 'center',
                  },
                  {
                    title: 'Efficiency',
                    dataIndex: 'efficiency',
                    key: 'efficiency',
                    width: 120,
                    align: 'center',
                    render: (value) => (
                      <span className={
                        value >= 98 ? styles.efficiencyBadgeExcellent : 
                        value >= 95 ? styles.efficiencyBadgeGood : 
                        styles.efficiencyBadgePoor
                      }>
                        {value}%
                      </span>
                    ),
                  },
                  
                ]}
                dataSource={[
                  {
                    key: '1',
                    mealType: 'Breakfast',
                    orderCount: 85,
                    serveCount: 82,
                    efficiency: 96,
                    status: 'Good'
                  },
                  {
                    key: '2',
                    mealType: 'Lunch',
                    orderCount: 120,
                    serveCount: 118,
                    efficiency: 98,
                    status: 'Excellent'
                  },
                  {
                    key: '3',
                    mealType: 'Dinner',
                    orderCount: 95,
                    serveCount: 90,
                    efficiency: 95,
                    status: 'Good'
                  }
                ]}
                pagination={false}
                className={styles.table}
                bordered
              />
            </div>
          </TabPane>

          <TabPane 
            tab={
              <span className={styles.tabPaneTitle}>
                <Users className={styles.tabIcon16} size={16} />
                Employee Report
              </span>
            } 
            key="employee"
          >
            <div style={{ marginBottom: '24px' }}>
              <div className={styles.tabContentHeader}>
                {/* <Users className={styles.tabIcon} size={24} /> */}
                <div>
                  <h2 className={styles.tabTitle}>
                    Individual Employee Report
                  </h2>
                  <p className={styles.tabDescription}>
                    Detailed meal consumption history for a specific employee
                  </p>
                </div>
              </div>

              <div className={styles.controlsContainerWrap}>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    Employee ID
                  </label>
                  <input 
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Enter Employee ID"
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    Time Period
                  </label>
                  <Select 
                    value={employeeTimePeriod} 
                    onChange={setEmployeeTimePeriod}
                    className={styles.selectInput}
                  >
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="monthly">Monthly</Option>
                    <Option value="custom">Custom Range</Option>
                  </Select>
                </div>
                {employeeTimePeriod === 'custom' && (
                  <>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>
                        Start Date
                      </label>
                      <input 
                        type="date"
                        defaultValue="2025-01-06"
                        className={styles.dateInput}
                      />
                    </div>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>
                        End Date
                      </label>
                      <input 
                        type="date"
                        className={styles.dateInput}
                        placeholder="mm/dd/yyyy"
                      />
                    </div>
                  </>
                )}
                <Button 
                  type="primary" 
                  onClick={() => console.log('Generating employee report...')}
                  className={styles.generateButtonDark}
                >
                  Generate Report
                </Button>
              </div>

              <Table
                columns={[
                  {
                    title: 'Date',
                    dataIndex: 'date',
                    key: 'date',
                    width: 120,
                  },
                  {
                    title: 'Meal Type',
                    dataIndex: 'mealType',
                    key: 'mealType',
                    width: 120,
                  },
                  {
                    title: 'Order Time',
                    dataIndex: 'orderTime',
                    key: 'orderTime',
                    width: 120,
                    align: 'center',
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    width: 120,
                    align: 'center',
                    render: (status) => (
                      <span className={
                        status === 'Served' ? styles.statusBadgeServed : styles.statusBadgePending
                      }>
                        {status}
                      </span>
                    ),
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    width: 120,
                    align: 'center',
                    render: () => (
                      <Button 
                        type="link" 
                        className={styles.viewDetailsButton}
                        onClick={() => console.log('View details clicked')}
                      >
                        View Details
                      </Button>
                    ),
                  },
                ]}
                dataSource={[
                  {
                    key: '1',
                    date: '2024-01-15',
                    mealType: 'Breakfast',
                    orderTime: '08:30',
                    status: 'Served'
                  },
                  {
                    key: '2',
                    date: '2024-01-15',
                    mealType: 'Lunch',
                    orderTime: '12:45',
                    status: 'Served'
                  }
                ]}
                pagination={false}
                className={styles.table}
                bordered
              />
            </div>
          </TabPane>
        </Tabs>

        <div className={styles.downloadSection}>
          <Button 
            type="default" 
            icon={<Download size={16} />}
            className={styles.downloadButton}
          >
            Download PDF
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Report;