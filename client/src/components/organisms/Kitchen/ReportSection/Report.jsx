import React, { useState, useEffect } from 'react';
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

  // Enhanced token retrieval with multiple fallback methods
  const getAuthToken = () => {
    // Try multiple possible token storage locations
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('accessToken') ||
                  sessionStorage.getItem('token') || 
                  sessionStorage.getItem('authToken') ||
                  sessionStorage.getItem('accessToken');
    
    console.log('Retrieved token:', token ? 'Token found' : 'No token found');
    return token;
  };

  // Enhanced API calls with better error handling and debugging
  const fetchOrders = async () => {
    try {
      const token = getAuthToken();
      console.log('Fetching orders with token:', token ? 'Present' : 'Missing');
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Only add Authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:3000/orders', {
        method: 'GET',
        headers: headers,
      });
      
      console.log('Orders response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Fetched orders:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error(`Failed to fetch orders: ${error.message}`);
      return [];
    }
  };

  // Fixed to use /user endpoint instead of /employees
  const fetchEmployees = async () => {
    try {
      const token = getAuthToken();
      console.log('Fetching users/employees with token:', token ? 'Present' : 'Missing');
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Only add Authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:3000/user', {
        method: 'GET',
        headers: headers,
      });
      
      console.log('Users response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Fetched users/employees:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching users/employees:', error);
      message.error(`Failed to fetch employees: ${error.message}`);
      return [];
    }
  };

  const fetchMealTypes = async () => {
    try {
      const token = getAuthToken();
      console.log('Fetching meal types with token:', token ? 'Present' : 'Missing');
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Only add Authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:3000/meal-types', {
        method: 'GET',
        headers: headers,
      });
      
      console.log('Meal types response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch meal types: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Fetched meal types:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching meal types:', error);
      message.error(`Failed to fetch meal types: ${error.message}`);
      return [];
    }
  };

// Enhanced data processing with better employee name mapping
const processEmployeeMealData = (orders, employees, mealTypes) => {
  console.log('Processing data with:', { 
    ordersCount: orders?.length || 0, 
    employeesCount: employees?.length || 0, 
    mealTypesCount: mealTypes?.length || 0 
  });
  
  if (!orders || !employees || !mealTypes) {
    console.error('Missing required data for processing');
    return { processedData: [], dynamicMealTypes: [] };
  }

  if (orders.length === 0) {
    console.warn('No orders found');
    return { processedData: [], dynamicMealTypes: [] };
  }

  // Create user lookup map where user.id maps to user name
  // Employee ID from orders = User ID in user table
  const employeeMap = employees.reduce((acc, user) => {
    // Get user ID (this should match employee ID from orders)
    const userId = user.id || user.userId || user.user_id;
    
    // Get user name from various possible fields
    const userName = user.name || user.userName || user.user_name || 
                    user.fullName || user.full_name || 
                    user.firstName || user.first_name ||
                    (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                    (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null) ||
                    user.username || user.email?.split('@')[0] || // fallback to username or email prefix
                    `User ${userId}`;
    
    if (userId) {
      // Store user name with user ID as key (employee ID from orders will match this)
      acc[userId] = userName;
      acc[userId.toString()] = userName; // Also store as string for safety
      
      // If userId looks like it might be a number, also store as number
      if (!isNaN(userId)) {
        acc[parseInt(userId)] = userName;
      }
    }
    
    console.log(`Mapped user: UserID=${userId}, UserName=${userName}`);
    return acc;
  }, {});

  // Create meal type lookup map with enhanced field matching
  const mealTypeMap = mealTypes.reduce((acc, mealType) => {
    const mealId = mealType.id || mealType.mealTypeId || mealType.meal_type_id;
    const mealName = mealType.name || mealType.mealTypeName || 
                     mealType.meal_type_name || mealType.type || 
                     `Meal Type ${mealId}`;
    
    if (mealId) {
      acc[mealId] = mealName.toLowerCase();
      acc[mealId.toString()] = mealName.toLowerCase(); // Also store as string
      
      // If mealId looks like it might be a number, also store as number
      if (!isNaN(mealId)) {
        acc[parseInt(mealId)] = mealName.toLowerCase();
      }
    }
    return acc;
  }, {});

  console.log('User lookup map (UserID -> UserName):', employeeMap);
  console.log('Meal type map:', mealTypeMap);

  // Get unique employee IDs from orders with better field matching
  const uniqueEmployeeIds = [...new Set(orders.map(order => {
    const empId = order.employeeId || order.employee_id || order.userId || order.user_id;
    console.log(`Order employee ID: ${empId} (type: ${typeof empId})`);
    return empId;
  }))].filter(id => id !== null && id !== undefined);

  console.log('Unique employee IDs from orders:', uniqueEmployeeIds);

  // Debug: Check which employee IDs have matching user names
  uniqueEmployeeIds.forEach(empId => {
    const foundName = employeeMap[empId] || employeeMap[empId.toString()] || employeeMap[parseInt(empId)];
    console.log(`Employee ID ${empId} -> User Name: ${foundName || 'NOT FOUND'}`);
  });

  // Get unique meal types from orders
  const uniqueMealTypeIds = [...new Set(orders.map(order => 
    order.mealTypeId || order.meal_type_id || order.mealType
  ))].filter(id => id !== null && id !== undefined);

  const dynamicMealTypes = uniqueMealTypeIds.map(mealTypeId => {
    const mealTypeName = mealTypeMap[mealTypeId] || mealTypeMap[mealTypeId.toString()] || 
                        mealTypeMap[parseInt(mealTypeId)] || `meal_type_${mealTypeId}`;
    return {
      id: mealTypeId,
      name: mealTypeName,
      displayName: mealTypeName.charAt(0).toUpperCase() + mealTypeName.slice(1)
    };
  });

  console.log('Dynamic meal types:', dynamicMealTypes);

  // Initialize employee meal counts
  const employeeMealCounts = {};

  // Initialize all employees who have orders
  uniqueEmployeeIds.forEach(empId => {
    if (empId !== null && empId !== undefined) {
      // Get user name from user table where user.id = employee ID from orders
      const userName = employeeMap[empId] || 
                      employeeMap[empId.toString()] || 
                      employeeMap[parseInt(empId)] || 
                      `Employee ${empId}`;
      
      const employeeRecord = {
        employeeId: empId,
        employeeName: userName, // This will now be the actual user name from user table
        totalMeals: 0
      };

      // Initialize all meal type counts to 0
      dynamicMealTypes.forEach(mealType => {
        employeeRecord[mealType.name] = 0;
      });

      employeeMealCounts[empId] = employeeRecord;
      console.log(`Initialized employee record with user name:`, employeeRecord);
    }
  });

  // Process orders and count meals
  orders.forEach(order => {
    const employeeId = order.employeeId || order.employee_id || order.userId || order.user_id;
    const mealTypeId = order.mealTypeId || order.meal_type_id || order.mealType;
    
    if (employeeId && mealTypeId && employeeMealCounts[employeeId]) {
      const mealTypeName = mealTypeMap[mealTypeId] || mealTypeMap[mealTypeId.toString()] || 
                          mealTypeMap[parseInt(mealTypeId)];
      
      console.log(`Processing order: Employee ${employeeId}, Meal Type ID: ${mealTypeId}, Meal Type Name: ${mealTypeName}`);

      // Get the count of meals from the meals array or default to 1
      let mealCount = 1;
      if (order.meals && Array.isArray(order.meals)) {
        mealCount = order.meals.length;
      } else if (order.meals && typeof order.meals === 'string') {
        // Handle string format like "2:1" - split by comma and count
        mealCount = order.meals.split(',').length;
      } else if (order.quantity && !isNaN(order.quantity)) {
        mealCount = parseInt(order.quantity);
      }

      // Increment meal count based on meal type
      if (mealTypeName && employeeMealCounts[employeeId][mealTypeName] !== undefined) {
        employeeMealCounts[employeeId][mealTypeName] += mealCount;
        employeeMealCounts[employeeId].totalMeals += mealCount;
      } else {
        // If meal type name not found, still count total meals
        employeeMealCounts[employeeId].totalMeals += mealCount;
      }
    }
  });

  // Convert to array and add keys
  const processedData = Object.values(employeeMealCounts).map((employee, index) => ({
    key: (index + 1).toString(),
    ...employee
  }));

  console.log('Final processed data:', processedData);
  return { processedData, dynamicMealTypes };
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
        return orders;
    }

    return orders.filter(order => {
      const orderDate = new Date(order.orderDate || order.order_date || order.createdAt || order.created_at);
      return orderDate >= startDate;
    });
  };

  // Enhanced load data function with better error handling
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Starting data load...');
      
      // Check if token exists
      const token = getAuthToken();
      if (!token) {
        console.warn('No authentication token found');
        message.warning('No authentication token found. Some data may not be available.');
      }

      // Fetch all data with individual error handling
      console.log('Fetching all data...');
      const [ordersData, employeesData, mealTypesData] = await Promise.allSettled([
        fetchOrders(),
        fetchEmployees(),
        fetchMealTypes()
      ]);

      // Handle the results
      const orders = ordersData.status === 'fulfilled' ? ordersData.value : [];
      const employees = employeesData.status === 'fulfilled' ? employeesData.value : [];
      const mealTypes = mealTypesData.status === 'fulfilled' ? mealTypesData.value : [];

      console.log('Data fetch results:', {
        orders: { status: ordersData.status, count: orders.length },
        employees: { status: employeesData.status, count: employees.length },
        mealTypes: { status: mealTypesData.status, count: mealTypes.length }
      });

      // Store the raw data
      setOrders(orders);
      setEmployees(employees);
      setMealTypes(mealTypes);

      // Show warnings for failed requests
      if (employeesData.status === 'rejected') {
        message.warning('Failed to load employee data. Employee names may not display correctly.');
      }
      if (mealTypesData.status === 'rejected') {
        message.warning('Failed to load meal type data. Meal type names may not display correctly.');
      }

      // Process data even if some requests failed
      if (orders.length > 0) {
        // Filter orders based on time period
        const filteredOrders = filterDataByTimePeriod(orders, timePeriod);
        console.log('Filtered orders:', filteredOrders.length);

        // Process the data
        const result = processEmployeeMealData(filteredOrders, employees, mealTypes);
        
        if (result && result.processedData) {
          setEmployeeData(result.processedData);

          if (result.processedData.length === 0) {
            message.info('No data found for the selected time period');
          } else {
            message.success(`Loaded ${result.processedData.length} employee records`);
          }
        } else {
          setEmployeeData([]);
          message.warning('Unable to process data.');
        }
      } else {
        setEmployeeData([]);
        message.info('No order data available');
      }

    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Failed to load report data');
      setEmployeeData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when time period changes
  useEffect(() => {
    loadData();
  }, [timePeriod]);

  // Generate dynamic columns based on available meal types
  const generateDynamicColumns = () => {
    if (employeeData.length === 0) return [];

    const standardFields = ['key', 'employeeId', 'employeeName', 'totalMeals'];
    const firstEmployee = employeeData[0];
    const mealTypeKeys = Object.keys(firstEmployee).filter(key => !standardFields.includes(key));

    const dynamicColumns = mealTypeKeys.map(mealType => ({
      title: mealType.charAt(0).toUpperCase() + mealType.slice(1),
      dataIndex: mealType,
      key: mealType,
      width: 120,
      align: 'center',
      render: (value) => {
        const price = mealPrices[mealType] || 0;
        return (
          <div className={styles.mealCell}>
            <div className={styles.mealCount}>{value || 0}</div>
            <div className={styles.mealPrice}>${((value || 0) * price).toFixed(2)}</div>
          </div>
        );
      },
    }));

    return dynamicColumns;
  };

  // Calculate totals
  const calculateTotals = () => {
    if (employeeData.length === 0) return { totalMeals: 0, grandTotal: 0, mealTypeTotals: {} };

    const standardFields = ['key', 'employeeId', 'employeeName', 'totalMeals'];
    const mealTypeKeys = Object.keys(employeeData[0]).filter(key => !standardFields.includes(key));

    const totals = employeeData.reduce((acc, employee) => {
      mealTypeKeys.forEach(mealType => {
        if (!acc[mealType]) acc[mealType] = 0;
        acc[mealType] += employee[mealType] || 0;
      });
      acc.totalMeals += employee.totalMeals || 0;
      return acc;
    }, { totalMeals: 0 });

    // Calculate grand total
    let grandTotal = 0;
    mealTypeKeys.forEach(mealType => {
      const price = mealPrices[mealType] || 0;
      grandTotal += (totals[mealType] || 0) * price;
    });

    return { ...totals, grandTotal, mealTypeKeys };
  };

  const totals = calculateTotals();

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
    ...generateDynamicColumns(),
    {
      title: 'Total Meals',
      dataIndex: 'totalMeals',
      key: 'totalMeals',
      width: 140,
      align: 'center',
      render: (value) => (
        <div className={styles.totalMealsCell}>
          <div className={styles.totalCount}>{value || 0}</div>
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
        const standardFields = ['key', 'employeeId', 'employeeName', 'totalMeals'];
        const mealTypeKeys = Object.keys(record).filter(key => !standardFields.includes(key));
        
        const totalCost = mealTypeKeys.reduce((sum, mealType) => {
          const price = mealPrices[mealType] || 0;
          return sum + ((record[mealType] || 0) * price);
        }, 0);

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

    const mealStats = (totals.mealTypeKeys || []).map(mealType => ({
      name: mealType.charAt(0).toUpperCase() + mealType.slice(1),
      count: totals[mealType] || 0,
      percentage: Math.round(((totals[mealType] || 0) / totals.totalMeals) * 100)
    }));

    mealStats.sort((a, b) => b.percentage - a.percentage);

    const highDemand = mealStats.filter(meal => meal.percentage > 30);
    const lowDemand = mealStats.filter(meal => meal.percentage <= 30);

    return { highDemand, lowDemand };
  };

  const { highDemand, lowDemand } = calculateMealPopularity();

  const handleGenerateReport = () => {
    console.log(`Generating ${timePeriod} report...`);
    loadData();
    message.success(`${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} report generated successfully!`);
  };

  // Generate summary row for table
  const generateSummaryRow = () => {
    const summaryColumns = [
      <Table.Summary.Cell key="label" index={0} colSpan={2}>
        <strong>Grand Total:</strong>
      </Table.Summary.Cell>
    ];

    (totals.mealTypeKeys || []).forEach((mealType, index) => {
      const price = mealPrices[mealType] || 0;
      summaryColumns.push(
        <Table.Summary.Cell key={mealType} index={index + 2} align="center">
          <div className={styles.summaryCell}>
            <div className={styles.summaryCount}>{totals[mealType] || 0}</div>
            <div className={styles.summaryPrice}>${((totals[mealType] || 0) * price).toFixed(2)}</div>
          </div>
        </Table.Summary.Cell>
      );
    });

    summaryColumns.push(
      <Table.Summary.Cell key="totalMeals" index={summaryColumns.length} align="center">
        <div className={styles.summaryTotalMeals}>
          <div className={styles.summaryTotalCount}>{totals.totalMeals}</div>
          <div className={styles.summaryTotalText}>Total Meals</div>
        </div>
      </Table.Summary.Cell>
    );

    summaryColumns.push(
      <Table.Summary.Cell key="grandTotal" index={summaryColumns.length} align="center">
        <div className={styles.summaryGrandTotal}>
          <div className={styles.summaryGrandAmount}>${totals.grandTotal.toFixed(2)}</div>
          <div className={styles.summaryGrandText}>Grand Total</div>
        </div>
      </Table.Summary.Cell>
    );

    return summaryColumns;
  };

  return (
    <div className={styles.container}>
      {/* Token Status Indicator (for debugging) */}
      {!getAuthToken() && (
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          padding: '8px 16px', 
          marginBottom: '16px',
          borderRadius: '4px',
          color: '#856404'
        }}>
          ⚠️ No authentication token found. Please ensure you're logged in.
        </div>
      )}

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
                    emptyText: loading ? 'Loading data...' : 'No data available for the selected time period'
                  }}
                  summary={employeeData.length > 0 ? () => (
                    <Table.Summary.Row className={styles.summaryRow}>
                      {generateSummaryRow()}
                    </Table.Summary.Row>
                  ) : undefined}
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
            <div style={{ marginBottom: "24px" }}>
              <div className={styles.tabContentHeader}>
                <div>
                  <h2 className={styles.tabTitle}>Order Details Report</h2>
                  <p className={styles.tabDescription}>
                    Detailed analysis of meal orders, serve counts, and
                    efficiency metrics
                  </p>
                </div>
              </div>

              <div className={styles.controlsContainerWrap}>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>Time Period</label>
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
                {orderTimePeriod === "custom" && (
                  <>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>Start Date</label>
                      <input type="date" className={styles.dateInput} />
                    </div>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>End Date</label>
                      <input type="date" className={styles.dateInput} />
                    </div>
                  </>
                )}
                <Button
                  type="primary"
                  onClick={() =>
                    console.log("Generating order details report...")
                  }
                  className={styles.generateButtonDark}
                >
                  Generate Report
                </Button>
              </div>

              <Table
                columns={[
                  {
                    title: "Meal Type",
                    dataIndex: "mealType",
                    key: "mealType",
                    width: 150,
                  },
                  {
                    title: "Order Count",
                    dataIndex: "orderCount",
                    key: "orderCount",
                    width: 120,
                    align: "center",
                  },
                  {
                    title: "Serve Count",
                    dataIndex: "serveCount",
                    key: "serveCount",
                    width: 120,
                    align: "center",
                  },
                  {
                    title: "Efficiency",
                    dataIndex: "efficiency",
                    key: "efficiency",
                    width: 120,
                    align: "center",
                    render: (value) => (
                      <span
                        className={
                          value >= 98
                            ? styles.efficiencyBadgeExcellent
                            : value >= 95
                            ? styles.efficiencyBadgeGood
                            : styles.efficiencyBadgePoor
                        }
                      >
                        {value}%
                      </span>
                    ),
                  },
                ]}
                dataSource={[
                  {
                    key: "1",
                    mealType: "Breakfast",
                    orderCount: 85,
                    serveCount: 82,
                    efficiency: 96,
                    status: "Good",
                  },
                  {
                    key: "2",
                    mealType: "Lunch",
                    orderCount: 120,
                    serveCount: 118,
                    efficiency: 98,
                    status: "Excellent",
                  },
                  {
                    key: "3",
                    mealType: "Dinner",
                    orderCount: 95,
                    serveCount: 90,
                    efficiency: 95,
                    status: "Good",
                  },
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
            <div style={{ marginBottom: "24px" }}>
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
                  <label className={styles.controlLabel}>Employee ID</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Enter Employee ID"
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>Time Period</label>
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
                {employeeTimePeriod === "custom" && (
                  <>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>Start Date</label>
                      <input
                        type="date"
                        defaultValue="2025-01-06"
                        className={styles.dateInput}
                      />
                    </div>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>End Date</label>
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
                  onClick={() => console.log("Generating employee report...")}
                  className={styles.generateButtonDark}
                >
                  Generate Report
                </Button>
              </div>

              <Table
                columns={[
                  {
                    title: "Date",
                    dataIndex: "date",
                    key: "date",
                    width: 120,
                  },
                  {
                    title: "Meal Type",
                    dataIndex: "mealType",
                    key: "mealType",
                    width: 120,
                  },
                  {
                    title: "Order Time",
                    dataIndex: "orderTime",
                    key: "orderTime",
                    width: 120,
                    align: "center",
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    width: 120,
                    align: "center",
                    render: (status) => (
                      <span
                        className={
                          status === "Served"
                            ? styles.statusBadgeServed
                            : styles.statusBadgePending
                        }
                      >
                        {status}
                      </span>
                    ),
                  },
                  {
                    title: "Actions",
                    key: "actions",
                    width: 120,
                    align: "center",
                    render: () => (
                      <Button
                        type="link"
                        className={styles.viewDetailsButton}
                        onClick={() => console.log("View details clicked")}
                      >
                        View Details
                      </Button>
                    ),
                  },
                ]}
                dataSource={[
                  {
                    key: "1",
                    date: "2024-01-15",
                    mealType: "Breakfast",
                    orderTime: "08:30",
                    status: "Served",
                  },
                  {
                    key: "2",
                    date: "2024-01-15",
                    mealType: "Lunch",
                    orderTime: "12:45",
                    status: "Served",
                  },
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
