import React, { useState, useEffect } from "react";
import { Card, Progress, Table, Tabs, Button, Select, Spin, message } from "antd";
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
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [orders, setOrders] = useState([]);

  // Meal pricing
  const mealPrices = {
    breakfast: 5.50,
    lunch: 8.75,
    dinner: 12.25
  };

  // Get token from localStorage or your auth context
  const getAuthToken = () => {
    // Replace this with your actual token retrieval method
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API calls with Authorization headers
  const fetchOrders = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3000/orders', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      console.log('Fetched orders:', data);
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Failed to fetch orders');
      return [];
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3000/user', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      console.log('Fetched employees:', data);
      return data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Failed to fetch employees');
      return [];
    }
  };

  const fetchMealTypes = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3000/meal-types', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch meal types');
      const data = await response.json();
      console.log('Fetched meal types:', data);
      return data;
    } catch (error) {
      console.error('Error fetching meal types:', error);
      message.error('Failed to fetch meal types');
      return [];
    }
  };

  // Process data function - Fixed logic
  const processEmployeeMealData = (orders, employees, mealTypes) => {
    console.log('Processing data with:', { orders, employees, mealTypes });
    
    // Create lookup maps
    const employeeMap = employees.reduce((acc, emp) => {
      // Handle different possible property names for employee ID and name
      const empId = emp.id || emp.employeeId || emp.employee_id;
      const empName = emp.name || emp.employeeName || emp.employee_name || emp.fullName;
      acc[empId] = empName;
      return acc;
    }, {});

    const mealTypeMap = mealTypes.reduce((acc, mealType) => {
      // Handle different possible property names for meal type ID and name
      const mealId = mealType.id || mealType.mealTypeId || mealType.meal_type_id;
      const mealName = mealType.name || mealType.mealTypeName || mealType.meal_type_name;
      acc[mealId] = mealName ? mealName.toLowerCase() : '';
      return acc;
    }, {});

    console.log('Employee map:', employeeMap);
    console.log('Meal type map:', mealTypeMap);

    // Get unique employee IDs from orders
    const uniqueEmployeeIds = [...new Set(orders.map(order => 
      order.employeeId || order.employee_id || order.userId || order.user_id
    ))];

    console.log('Unique employee IDs from orders:', uniqueEmployeeIds);

    // Initialize employee meal counts
    const employeeMealCounts = {};

    // Initialize all employees who have orders
    uniqueEmployeeIds.forEach(empId => {
      if (empId) {
        employeeMealCounts[empId] = {
          employeeId: empId,
          employeeName: employeeMap[empId] || `Employee ${empId}`,
          breakfast: 0,
          lunch: 0,
          dinner: 0
        };
      }
    });

    // Process orders and count meals
    orders.forEach(order => {
      const employeeId = order.employeeId || order.employee_id || order.userId || order.user_id;
      const mealTypeId = order.mealTypeId || order.meal_type_id || order.mealType;
      
      if (employeeId && mealTypeId && employeeMealCounts[employeeId]) {
        const mealTypeName = mealTypeMap[mealTypeId];
        
        console.log(`Processing order: Employee ${employeeId}, Meal Type: ${mealTypeName}`);

        // Increment meal count based on meal type
        if (mealTypeName === 'breakfast') {
          employeeMealCounts[employeeId].breakfast += 1;
        } else if (mealTypeName === 'lunch') {
          employeeMealCounts[employeeId].lunch += 1;
        } else if (mealTypeName === 'dinner') {
          employeeMealCounts[employeeId].dinner += 1;
        }
      }
    });

    // Convert to array and calculate totals
    const processedData = Object.values(employeeMealCounts).map((employee, index) => ({
      key: (index + 1).toString(),
      ...employee,
      totalMeals: employee.breakfast + employee.lunch + employee.dinner
    }));

    console.log('Processed data:', processedData);
    return processedData;
  };

  // Filter data based on time period
  const filterDataByTimePeriod = (orders, period) => {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return orders; // Return all data for custom or unknown periods
    }

    return orders.filter(order => {
      const orderDate = new Date(order.orderDate || order.order_date || order.createdAt || order.created_at);
      return orderDate >= startDate;
    });
  };

  // Load data function - Fixed to handle data flow properly
  const loadData = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch all data
      console.log('Fetching all data...');
      const [ordersData, employeesData, mealTypesData] = await Promise.all([
        fetchOrders(),
        fetchEmployees(),
        fetchMealTypes()
      ]);

      // Step 2: Store the raw data
      setOrders(ordersData);
      setEmployees(employeesData);
      setMealTypes(mealTypesData);

      // Step 3: Filter orders based on time period
      const filteredOrders = filterDataByTimePeriod(ordersData, timePeriod);
      console.log('Filtered orders:', filteredOrders);

      // Step 4: Process the data to get employee meal consumption
      const processedData = processEmployeeMealData(filteredOrders, employeesData, mealTypesData);
      
      // Step 5: Set the processed data
      setEmployeeData(processedData);

      if (processedData.length === 0) {
        message.info('No data found for the selected time period');
      }

    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when time period changes
  useEffect(() => {
    loadData();
  }, [timePeriod]);

  // Calculate totals
  const totals = employeeData.reduce(
    (acc, employee) => ({
      breakfast: acc.breakfast + employee.breakfast,
      lunch: acc.lunch + employee.lunch,
      dinner: acc.dinner + employee.dinner,
      totalMeals: acc.totalMeals + employee.totalMeals
    }),
    { breakfast: 0, lunch: 0, dinner: 0, totalMeals: 0 }
  );

  const grandTotal = 
    totals.breakfast * mealPrices.breakfast +
    totals.lunch * mealPrices.lunch +
    totals.dinner * mealPrices.dinner;

  // Table columns definition
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
      width: 120,
      align: 'center',
      render: (value) => (
        <div className={styles.mealCell}>
          <div className={styles.mealCount}>{value}</div>
          <div className={styles.mealPrice}>${(value * mealPrices.breakfast).toFixed(2)}</div>
        </div>
      ),
    },
    {
      title: 'Lunch',
      dataIndex: 'lunch',
      key: 'lunch',
      width: 120,
      align: 'center',
      render: (value) => (
        <div className={styles.mealCell}>
          <div className={styles.mealCount}>{value}</div>
          <div className={styles.mealPrice}>${(value * mealPrices.lunch).toFixed(2)}</div>
        </div>
      ),
    },
    {
      title: 'Dinner',
      dataIndex: 'dinner',
      key: 'dinner',
      width: 120,
      align: 'center',
      render: (value) => (
        <div className={styles.mealCell}>
          <div className={styles.mealCount}>{value}</div>
          <div className={styles.mealPrice}>${(value * mealPrices.dinner).toFixed(2)}</div>
        </div>
      ),
    },
    {
      title: 'Total Meals',
      dataIndex: 'totalMeals',
      key: 'totalMeals',
      width: 140,
      align: 'center',
      render: (value) => (
        <div className={styles.totalMealsCell}>
          <div className={styles.totalCount}>{value}</div>
          <div className={styles.totalMealsText}>Total Meals</div>
        </div>
      ),
    },
    {
      title: 'Total Amount',
      key: 'totalAmount',
      width: 140,
      align: 'center',
      render: (_, record) => {
        const totalCost = 
          record.breakfast * mealPrices.breakfast +
          record.lunch * mealPrices.lunch +
          record.dinner * mealPrices.dinner;
        return (
          <div className={styles.totalAmountCell}>
            <div className={styles.totalAmount}>${totalCost.toFixed(2)}</div>
            <div className={styles.totalCostText}>Total Cost</div>
          </div>
        );
      },
    },
  ];

  // Calculate meal popularity for analysis
  const calculateMealPopularity = () => {
    if (totals.totalMeals === 0) return { highDemand: [], lowDemand: [] };

    const mealStats = [
      { name: "Breakfast", count: totals.breakfast, percentage: Math.round((totals.breakfast / totals.totalMeals) * 100) },
      { name: "Lunch", count: totals.lunch, percentage: Math.round((totals.lunch / totals.totalMeals) * 100) },
      { name: "Dinner", count: totals.dinner, percentage: Math.round((totals.dinner / totals.totalMeals) * 100) }
    ];

    // Sort by percentage
    mealStats.sort((a, b) => b.percentage - a.percentage);

    const highDemand = mealStats.filter(meal => meal.percentage > 30);
    const lowDemand = mealStats.filter(meal => meal.percentage <= 30);

    return { highDemand, lowDemand };
  };

  const { highDemand, lowDemand } = calculateMealPopularity();

  const handleGenerateReport = () => {
    console.log(`Generating ${timePeriod} report...`);
    loadData(); // Refresh data
    message.success(`${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} report generated successfully!`);
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
            {highDemand.length > 0 ? (
              highDemand.map((meal, index) => (
                <div key={index} className={styles.mealItem}>
                  <div className={styles.mealHeader}>
                    <span>{meal.name} ({meal.count} orders)</span>
                    <span className={styles.highDemandPercentage}>{meal.percentage}%</span>
                  </div>
                  <Progress 
                    percent={meal.percentage} 
                    strokeColor="#52c41a"
                    trailColor="#f0f0f0"
                    showInfo={false}
                  />
                </div>
              ))
            ) : (
              <div>No high demand meals data available</div>
            )}
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
            {lowDemand.length > 0 ? (
              lowDemand.map((meal, index) => (
                <div key={index} className={styles.mealItem}>
                  <div className={styles.mealHeader}>
                    <span>{meal.name} ({meal.count} orders)</span>
                    <span className={styles.lowDemandPercentage}>{meal.percentage}%</span>
                  </div>
                  <Progress 
                    percent={meal.percentage} 
                    strokeColor="#ff4d4f"
                    trailColor="#f0f0f0"
                    showInfo={false}
                  />
                </div>
              ))
            ) : (
              <div>No low demand meals data available</div>
            )}
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
                    loading={loading}
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
                  loading={loading}
                >
                  {loading ? 'Loading...' : 'Generate Report'}
                </Button>
              </div>

              <Spin spinning={loading}>
                <Table
                  columns={columns}
                  dataSource={employeeData}
                  pagination={false}
                  className={styles.table}
                  bordered
                  locale={{
                    emptyText: loading ? 'Loading data...' : 'No data available'
                  }}
                  summary={() => (
                    <Table.Summary.Row className={styles.summaryRow}>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <strong>Grand Total:</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="center">
                        <div className={styles.summaryCell}>
                          <div className={styles.summaryCount}>{totals.breakfast}</div>
                          <div className={styles.summaryPrice}>${(totals.breakfast * mealPrices.breakfast).toFixed(2)}</div>
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="center">
                        <div className={styles.summaryCell}>
                          <div className={styles.summaryCount}>{totals.lunch}</div>
                          <div className={styles.summaryPrice}>${(totals.lunch * mealPrices.lunch).toFixed(2)}</div>
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="center">
                        <div className={styles.summaryCell}>
                          <div className={styles.summaryCount}>{totals.dinner}</div>
                          <div className={styles.summaryPrice}>${(totals.dinner * mealPrices.dinner).toFixed(2)}</div>
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} align="center">
                        <div className={styles.summaryTotalMeals}>
                          <div className={styles.summaryTotalCount}>{totals.totalMeals}</div>
                          <div className={styles.summaryTotalText}>Total Meals</div>
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6} align="center">
                        <div className={styles.summaryGrandTotal}>
                          <div className={styles.summaryGrandAmount}>${grandTotal.toFixed(2)}</div>
                          <div className={styles.summaryGrandText}>Grand Total</div>
                        </div>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              </Spin>
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
            Download Excel 
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Report;