import React, { useState, useEffect } from "react";
import { Card, Table, Tabs, Button, Select, Spin, message } from "antd";
import { BarChart3, FileText, Users, Download } from "lucide-react";
import styles from "./Report.module.css";
import { useAuth } from "../../../../contexts/AuthContext.jsx";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";

const { TabPane } = Tabs;
const { Option } = Select;

const Report = () => {
  const urL = import.meta.env.VITE_BASE_URL;
  const [activeTab, setActiveTab] = useState("summary");
  const [timePeriod, setTimePeriod] = useState("daily");
  const [orderTimePeriod, setOrderTimePeriod] = useState("daily");
  const [employeeTimePeriod, setEmployeeTimePeriod] = useState("daily");
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [orders, setOrders] = useState([]);
  const [individualEmployeeData, setIndividualEmployeeData] = useState([]);
  const { authData } = useAuth();
  const [orderDetailsData, setOrderDetailsData] = useState([]);
  const token = authData?.accessToken;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderStartDate, setOrderStartDate] = useState("");
  const [orderEndDate, setOrderEndDate] = useState("");
  const [employeeStartDate, setEmployeeStartDate] = useState("");
  const [employeeEndDate, setEmployeeEndDate] = useState("");

  //  Common Functions.....

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
  };

  // Function to format time
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const time = new Date(timeString);
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // API calls to fetch orders
  const fetchOrders = async () => {
    try {
      console.log("Fetching orders...");
      const response = await axios.get(`${urL}/orders`, {
        params: {
          orgId: authData?.orgId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error(`Failed to fetch orders: ${error.message}`);
      return [];
    }
  };
  // fetch employee
  const fetchEmployees = async () => {
    try {
      console.log("Fetching users/employees...");
      const response = await axios.get(`${urL}/user`, {
        params: {
          orgId: authData?.orgId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching users/employees:", error);
      message.error(`Failed to fetch employees: ${error.message}`);
      return [];
    }
  };
  //fetch mealtypes
  const fetchMealTypes = async () => {
    try {
      console.log("Fetching meal types...");
      const response = await axios.get(
        `${urL}/meal-types?includeDeleted=true`,
        {
          params: {
            orgId: authData?.orgId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching meal types:", error);
      message.error(`Failed to fetch meal types: ${error.message}`);
      return [];
    }
  };
  const fetchEmpNoByUserId = async (userId) => {
    if (!userId || !authData?.orgId) return null;
    try {
      const response = await axios.get(`${urL}/user/${userId}/empno`, {
        params: { orgId: authData?.orgId },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.empNo || userId;
    } catch (error) {
      console.error(`Failed to fetch empNo for user ${userId}:`, error);
      return userId; // fallback to userId if error
    }
  };
  //End of common functions....

  //Summary Report......
  // Enhanced data processing with actual order prices
  const processEmployeeMealData = (orders, employees, mealTypes) => {
    // console.log("Processing data with:", {
    //   ordersCount: orders?.length || 0,
    //   employeesCount: employees?.length || 0,
    //   mealTypesCount: mealTypes?.length || 0,
    // });

    if (!orders || !employees || !mealTypes) {
      console.error("Missing required data for processing");
      return { processedData: [], dynamicMealTypes: [] };
    }

    if (orders.length === 0) {
      console.warn("No orders found");
      return { processedData: [], dynamicMealTypes: [] };
    }

    // Create user lookup map where user.id maps to user name
    const employeeMap = employees.reduce((acc, user) => {
      const userId = user.id;
      const userName = user.name;

      if (userId) {
        acc[userId] = userName;
      }

      // console.log(`Mapped user: UserID=${userId}, UserName=${userName}`);
      return acc;
    }, {});

    // Create meal type lookup map
    const mealTypeMap = mealTypes.reduce((acc, mealType) => {
      const mealId = mealType.id;
      const mealName = mealType.name;

      if (mealId) {
        acc[mealId] = mealName.toLowerCase();
        acc[mealId.toString()] = mealName.toLowerCase();
      
      }
      return acc;
    }, {});

    // console.log("User lookup map (UserID -> UserName):", employeeMap);
    // console.log("Meal type map:", mealTypeMap);

    // Get unique employee IDs from orders
    const uniqueEmployeeIds = [
      ...new Set(
        orders.map((order) => {
          const empId = order.employeeId;
          console.log(`Order employee ID: ${empId} (type: ${typeof empId})`);
          return empId;
        })
      ),
    ].filter((id) => id !== null && id !== undefined);

    console.log("Unique employee IDs from orders:", uniqueEmployeeIds);

    // Get unique meal types from orders
    const uniqueMealTypeIds = [
      ...new Set(orders.map((order) => order.mealTypeId)),
    ].filter((id) => id !== null && id !== undefined);

    const dynamicMealTypes = uniqueMealTypeIds.map((mealTypeId) => {
      const mealTypeName =
        mealTypeMap[mealTypeId];
;
      return {
        id: mealTypeId,
        name: mealTypeName,
        displayName:
          mealTypeName.charAt(0).toUpperCase() + mealTypeName.slice(1),
      };
    });

    // console.log("Dynamic meal types:", dynamicMealTypes);

    // Initialize employee meal counts and prices
    const employeeMealCounts = {};

    // Initialize all employees who have orders
    uniqueEmployeeIds.forEach((empId) => {
      if (empId !== null && empId !== undefined) {
        const userName =
          employeeMap[empId] ||
          `Employee ${empId}`;

        const employeeRecord = {
          employeeId: empId,
          employeeName: userName,
          totalMeals: 0,
          totalAmount: 0, // Add total amount tracking
        };

        // Initialize all meal type counts and prices to 0
        dynamicMealTypes.forEach((mealType) => {
          employeeRecord[mealType.name] = 0;
          employeeRecord[`${mealType.name}_price`] = 0; // Track price for each meal type
        });

        employeeMealCounts[empId] = employeeRecord;
        // console.log(
        //   `Initialized employee record with user name:`,
        //   employeeRecord
        // );
      }
    });

    // Process orders and count meals with actual prices - FIXED SECTION
    orders.forEach((order) => {
      const employeeId = order.employeeId;
      const mealTypeId = order.mealTypeId;

      // FIXED: Properly parse the price from the order
      const orderPrice = parseFloat(order.price || 0);

      // console.log(`Processing order:`, {
      //   employeeId,
      //   mealTypeId,
      //   orderPrice,
      //   rawPrice: order.price,
      //   orderData: order,
      // });

      if (employeeId && mealTypeId && employeeMealCounts[employeeId]) {
        const mealTypeName =
          mealTypeMap[mealTypeId] ;

        // console.log(
        //   `Processing order: Employee ${employeeId}, Meal Type ID: ${mealTypeId}, Meal Type Name: ${mealTypeName}, Price: ${orderPrice}`
        // );

        // FIXED: Calculate meal count more accurately
        let mealCount = 1;
        if (order.meals && Array.isArray(order.meals)) {
          mealCount = order.meals.length;
        } else if (order.meals && typeof order.meals === "string") {
          // Handle string array format like "['meal1', 'meal2']"
          try {
            const parsedMeals = JSON.parse(order.meals);
            mealCount = Array.isArray(parsedMeals) ? parsedMeals.length : 1;
          } catch (e) {
            // If parsing fails, try splitting by comma
            mealCount = order.meals.split(",").length;
          }
        } 

        // FIXED: Increment meal count and add price based on meal type
        if (
          mealTypeName &&
          employeeMealCounts[employeeId][mealTypeName] !== undefined
        ) {
          employeeMealCounts[employeeId][mealTypeName] += mealCount;

          // FIXED: Add the actual order price 
          employeeMealCounts[employeeId][`${mealTypeName}_price`] += orderPrice;
          employeeMealCounts[employeeId].totalMeals += mealCount;
          employeeMealCounts[employeeId].totalAmount += orderPrice;

          // console.log(`Updated employee ${employeeId}:`, {
          //   mealType: mealTypeName,
          //   mealCount: employeeMealCounts[employeeId][mealTypeName],
          //   mealPrice: employeeMealCounts[employeeId][`${mealTypeName}_price`],
          //   totalAmount: employeeMealCounts[employeeId].totalAmount,
          // });
        } else {
          // If meal type name not found, still count total meals and amount
          employeeMealCounts[employeeId].totalMeals += mealCount;
          employeeMealCounts[employeeId].totalAmount += orderPrice;

          // console.log(`Unknown meal type for employee ${employeeId}:`, {
          //   mealTypeId,
          //   mealTypeName,
          //   totalAmount: employeeMealCounts[employeeId].totalAmount,
          // });
        }
      } else {
        console.warn(`Skipping order - missing data:`, {
          employeeId,
          mealTypeId,
          hasEmployee: !!employeeMealCounts[employeeId],
          orderPrice,
        });
      }
    });

    // Convert to array and add keys
    const processedData = Object.values(employeeMealCounts).map(
      (employee, index) => ({
        key: (index + 1).toString(),
        ...employee,
      })
    );

    // console.log("Final processed data with prices:", processedData);

    // FIXED: Add validation to ensure prices are properly calculated
    processedData.forEach((employee) => {
      console.log(`Employee ${employee.employeeName} summary:`, {
        totalMeals: employee.totalMeals,
        totalAmount: employee.totalAmount,
        mealTypePrices: Object.keys(employee)
          .filter((key) => key.endsWith("_price"))
          .reduce((acc, key) => {
            acc[key] = employee[key];
            return acc;
          }, {}),
      });
    });

    return { processedData, dynamicMealTypes };
  };

  // Filter data based on time period
  const filterDataByTimePeriod = (
    orders,
    period,
    customStartDate = null,
    customEndDate = null
  ) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
        } else {
          return orders; // Return all orders if custom dates not provided
        }
        break;
      default:
        return orders;
    }

    return orders.filter((order) => {
      const orderDate = new Date(
        order.orderDate 
      );
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  // Load data function
  const loadData = async (customStartDate = null, customEndDate = null) => {
    setLoading(true);
    try {
      const [ordersData, employeesData, mealTypesData] =
        await Promise.allSettled([
          fetchOrders(),
          fetchEmployees(),
          fetchMealTypes(),
        ]);

      const orders = ordersData.status === "fulfilled" ? ordersData.value : [];
      const employees =
        employeesData.status === "fulfilled" ? employeesData.value : [];
      const mealTypes =
        mealTypesData.status === "fulfilled" ? mealTypesData.value : [];

      // console.log("Data fetch results:", {
      //   orders: { status: ordersData.status, count: orders.length },
      //   employees: { status: employeesData.status, count: employees.length },
      //   mealTypes: { status: mealTypesData.status, count: mealTypes.length },
      // });

      setOrders(orders);
      setEmployees(employees);
      setMealTypes(mealTypes);

      if (employeesData.status === "rejected") {
        message.warning(
          "Failed to load employee data. Employee names may not display correctly."
        );
      }
      if (mealTypesData.status === "rejected") {
        message.warning(
          "Failed to load meal type data. Meal type names may not display correctly."
        );
      }

      if (orders.length > 0) {
        const filteredOrders = filterDataByTimePeriod(
          orders,
          timePeriod,
          customStartDate,
          customEndDate
        );
        // console.log("Filtered orders:", filteredOrders.length);

        const result = processEmployeeMealData(
          filteredOrders,
          employees,
          mealTypes
        );

        if (result && result.processedData) {
          setEmployeeData(result.processedData);

          const updateEmpNos = async () => {
            const updated = await Promise.all(
              result.processedData.map(async (emp) => {
                const empNo = await fetchEmpNoByUserId(emp.employeeId);
                return { ...emp, employeeId: empNo };
              })
            );
            setEmployeeData(updated);
          };
          updateEmpNos();

          if (result.processedData.length > 0) {
            message.success(
              `${
                timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)
              } report generated successfully!`
            );
          } else {
            message.warning("No data available for the selected time period");
          }
        } else {
          setEmployeeData([]);
          message.warning("No data available for the selected time period");
        }
      } else {
        setEmployeeData([]);
        message.warning("No data available for the selected time period");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      message.error("Failed to load report data");
      setEmployeeData([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic columns based on available meal types with actual prices
  const generateDynamicColumns = () => {
    if (employeeData.length === 0) return [];

    const standardFields = [
      "key",
      "employeeId",
      "employeeName",
      "totalMeals",
      "totalAmount",
    ];
    const firstEmployee = employeeData[0];
    const mealTypeKeys = Object.keys(firstEmployee).filter(
      (key) => !standardFields.includes(key) && !key.endsWith("_price")
    );

    const dynamicColumns = mealTypeKeys.map((mealType) => ({
      title: mealType.charAt(0).toUpperCase() + mealType.slice(1),
      dataIndex: mealType,
      key: mealType,
      width: 120,
      align: "center",
      render: (value, record) => {
        const priceKey = `${mealType}_price`;
        const totalPrice = record[priceKey] || 0;
        return (
          <div className={styles.mealCell}>
            <div className={styles.mealCount}>{value || 0}</div>
            <div className={styles.mealPrice}>Rs. {totalPrice.toFixed(2)}</div>
          </div>
        );
      },
    }));

    return dynamicColumns;
  };

  // Calculate totals with actual prices
  const calculateTotals = () => {
    if (employeeData.length === 0)
      return { totalMeals: 0, grandTotal: 0, mealTypeTotals: {} };

    const standardFields = [
      "key",
      "employeeId",
      "employeeName",
      "totalMeals",
      "totalAmount",
    ];
    const mealTypeKeys = Object.keys(employeeData[0]).filter(
      (key) => !standardFields.includes(key) && !key.endsWith("_price")
    );

    const totals = employeeData.reduce(
      (acc, employee) => {
        mealTypeKeys.forEach((mealType) => {
          if (!acc[mealType]) acc[mealType] = 0;
          if (!acc[`${mealType}_price`]) acc[`${mealType}_price`] = 0;

          acc[mealType] += employee[mealType] || 0;
          acc[`${mealType}_price`] += employee[`${mealType}_price`] || 0;
        });
        acc.totalMeals += employee.totalMeals || 0;
        acc.grandTotal += employee.totalAmount || 0;
        return acc;
      },
      { totalMeals: 0, grandTotal: 0 }
    );

    return { ...totals, mealTypeKeys };
  };

  const totals = calculateTotals();

  // Generate summary row for table with actual prices
  const generateSummaryRow = () => {
    const summaryColumns = [
      <Table.Summary.Cell key="label" index={0} colSpan={2}>
        <strong>Grand Total:</strong>
      </Table.Summary.Cell>,
    ];

    (totals.mealTypeKeys || []).forEach((mealType, index) => {
      const priceKey = `${mealType}_price`;
      const totalPrice = totals[priceKey] || 0;
      summaryColumns.push(
        <Table.Summary.Cell key={mealType} index={index + 2} align="center">
          <div className={styles.summaryCell}>
            <div className={styles.summaryCount}>{totals[mealType] || 0}</div>
            <div className={styles.summaryPrice}>
              Rs. {totalPrice.toFixed(2)}
            </div>
          </div>
        </Table.Summary.Cell>
      );
    });

    summaryColumns.push(
      <Table.Summary.Cell
        key="totalMeals"
        index={summaryColumns.length}
        align="center"
      >
        <div className={styles.summaryTotalMeals}>
          <div className={styles.summaryTotalCount}>{totals.totalMeals}</div>
          <div className={styles.summaryTotalText}>Total Meals</div>
        </div>
      </Table.Summary.Cell>
    );

    summaryColumns.push(
      <Table.Summary.Cell
        key="grandTotal"
        index={summaryColumns.length}
        align="center"
      >
        <div className={styles.summaryGrandTotal}>
          <div className={styles.summaryGrandAmount}>
            Rs. {totals.grandTotal.toFixed(2)}
          </div>
          <div className={styles.summaryGrandText}>Grand Total</div>
        </div>
      </Table.Summary.Cell>
    );

    return summaryColumns;
  };

  const handleGenerateReport = () => {
    // console.log(`Generating ${timePeriod} report...`);

    // Validate custom date range if selected
    if (timePeriod === "custom") {
      if (!startDate || !endDate) {
        message.error(
          "Please select both start date and end date for custom range"
        );
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        message.error("Start date cannot be later than end date");
        return;
      }
    }
    const customStartDate = timePeriod === "custom" ? startDate : null;
    const customEndDate = timePeriod === "custom" ? endDate : null;

    loadData(customStartDate, customEndDate);
  };
  // Table columns definition
  const columns = [
    {
      title: "Employee No",
      dataIndex: "employeeId",
      key: "employeeId",
      width: 120,
    },
    {
      title: "Employee Name",
      dataIndex: "employeeName",
      key: "employeeName",
      width: 180,
    },
    ...generateDynamicColumns(),
    {
      title: "Total Meals",
      dataIndex: "totalMeals",
      key: "totalMeals",
      width: 140,
      align: "center",
      render: (value) => (
        <div className={styles.totalMealsCell}>
          <div className={styles.totalCount}>{value || 0}</div>
          <div className={styles.totalMealsText}>Total Meals</div>
        </div>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 140,
      align: "center",
      render: (value) => (
        <div className={styles.totalAmountCell}>
          <div className={styles.totalAmount}>
            Rs. {(value || 0).toFixed(2)}
          </div>
          <div className={styles.totalCostText}>Total Cost</div>
        </div>
      ),
    },
  ];
  //End summary report.............

  // Order Details Report..........
  const processOrderDetailsData = (orders, mealTypes) => {
    if (!orders || !mealTypes) return [];

    console.log("Processing order details with:", {
      ordersCount: orders.length,
      mealTypesCount: mealTypes.length,
    });

    // Create meal type lookup by ID to get the name
    const mealTypeMap = mealTypes.reduce((acc, mealType) => {
      const mealId = mealType.id;
      const mealName = mealType.name;

      if (mealId) {
        acc[mealId.toString()] = mealName;
      }
      return acc;
    }, {});

    console.log("Meal type mapping:", mealTypeMap);

    // Group orders by meal type name (not ID)
    const groupedByMealType = {};

    orders.forEach((order) => {
      const mealTypeId = order.mealTypeId;
      const mealTypeName =
        mealTypeMap[mealTypeId?.toString()] ||
        `Unknown Meal Type ${mealTypeId}`;

      if (!groupedByMealType[mealTypeName]) {
        groupedByMealType[mealTypeName] = {
          orders: [],
          totalOrders: 0,
          servedOrders: 0,
        };
      }

      groupedByMealType[mealTypeName].orders.push(order);
      groupedByMealType[mealTypeName].totalOrders += 1;
     if (order.serve === true) {
        groupedByMealType[mealTypeName].servedOrders += 1;
      }
    });

    // console.log("Grouped by meal type:", groupedByMealType);

    // Convert to array format for the table
    const details = Object.entries(groupedByMealType).map(
      ([mealTypeName, data], index) => {
        const efficiency =
          data.totalOrders > 0
            ? Math.round((data.servedOrders / data.totalOrders) * 100)
            : 0;

        return {
          key: `${mealTypeName}_${index}`,
          mealType: mealTypeName,
          orderCount: data.totalOrders,
          serveCount: data.servedOrders,
          efficiency: efficiency,
        };
      }
    );

    // console.log("Final order details data:", details);
    return details.sort((a, b) => b.orderCount - a.orderCount); // Sort by order count descending
  };

  const handleGenerateOrderDetailsReport = async () => {
    // console.log("Generating order details report for period:", orderTimePeriod);

    // Validate custom date range if selected
    if (orderTimePeriod === "custom") {
      if (!orderStartDate || !orderEndDate) {
        message.error(
          "Please select both start date and end date for custom range"
        );
        return;
      }
      if (new Date(orderStartDate) > new Date(orderEndDate)) {
        message.error("Start date cannot be later than end date");
        return;
      }
    }

    setLoading(true);
    try {
      // Use already fetched data if available, otherwise fetch fresh data
      let ordersData = orders;
      let mealTypesData = mealTypes;

      if (!ordersData.length || !mealTypesData.length) {
        // console.log("Fetching fresh data...");
        const [ordersResult, mealTypesResult] = await Promise.allSettled([
          fetchOrders(),
          fetchMealTypes(),
        ]);

        ordersData =
          ordersResult.status === "fulfilled" ? ordersResult.value : [];
        mealTypesData =
          mealTypesResult.status === "fulfilled" ? mealTypesResult.value : [];
      }

      // console.log("Using data:", {
      //   orders: ordersData.length,
      //   mealTypes: mealTypesData.length,
      // });

      // Filter orders by selected time period
      const filteredOrders = filterOrdersByPeriod(
        ordersData,
        orderTimePeriod,
        orderStartDate,
        orderEndDate
      );
      console.log("Filtered orders:", filteredOrders.length);

      // Process the filtered orders
      const details = processOrderDetailsData(filteredOrders, mealTypesData);

      setOrderDetailsData(details);

      if (details.length === 0) {
        message.info("No order data found for the selected time period");
      } else {
        message.success(
          `Order details report generated successfully for ${orderTimePeriod} period!`
        );
      }
    } catch (error) {
      console.error("Error generating order details report:", error);
      message.error("Failed to generate order details report");
    } finally {
      setLoading(false);
    }
  };
  //filter oredrs by time range
  const filterOrdersByPeriod = (
    orders,
    period,
    customStartDate = null,
    customEndDate = null
  ) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          return orders;
        }
        break;
      default:
        return orders;
    }

    console.log(
      "Filtering orders from:",
      startDate.toISOString(),
      "to:",
      endDate.toISOString()
    );

    return orders.filter((order) => {
      const orderDate = new Date(
        order.orderDate 
      );

      const isInRange = orderDate >= startDate && orderDate <= endDate;
      if (!isInRange) {
        // console.log("Order excluded:", {
        //   orderDate: orderDate.toISOString(),
        //   startDate: startDate.toISOString(),
        //   endDate: endDate.toISOString(),
        // });
      }
      return isInRange;
    });
  };
  //End order details report.....

  // Employee Report.......
  // Function to fetch individual employee orders
  const fetchIndividualEmployeeOrders = async (employeeId, timePeriod) => {
    if (!employeeId || !employeeId.trim()) {
      message.warning("Please enter an Employee ID");
      return [];
    }
    try {
      setLoading(true);
      const response = await axios.get(`${urL}/orders`, {
        params: {
          orgId: authData?.orgId,
      
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allOrders = Array.isArray(response.data) ? response.data : [];
      // console.log("All orders fetched:", allOrders.length);

      // Filter orders by employee ID
      const employeeOrders = allOrders.filter((order) => {
        const orderEmployeeId = order.employeeId;
        return (
          orderEmployeeId &&
          orderEmployeeId.toString() === employeeId.toString()
        );
      });

      // console.log(`Orders for employee ${employeeId}:`, employeeOrders.length);

      if (employeeOrders.length === 0) {
        message.info(`No orders found for Employee ID: ${employeeId}`);
        return [];
      }

      // Filter by time period - pass custom dates if applicable
      const filteredOrders = filterOrdersByTimePeriod(
        employeeOrders,
        timePeriod,
        employeeTimePeriod === "custom" ? employeeStartDate : null,
        employeeTimePeriod === "custom" ? employeeEndDate : null
      );
      // console.log(`Orders after time filter:`, filteredOrders.length);

      // Get meal types to map meal type IDs to names
      let mealTypesData = mealTypes;

      if (!mealTypesData || mealTypesData.length === 0) {
        try {
          const mealTypesResponse = await axios.get(
            `${urL}/meal-types?includeDeleted=true`,
            {
              params: {
                orgId: authData?.orgId,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          mealTypesData = mealTypesResponse.data;
        } catch (error) {
          console.error("Error fetching meal types:", error);
        }
      }

      // Create meal type lookup
      const mealTypeMap = mealTypesData.reduce((acc, mealType) => {
        const mealId = mealType.id;
        const mealName = mealType.name || `Meal Type ${mealId}`;

        if (mealId) {
          acc[mealId] = mealName;
          acc[mealId.toString()] = mealName;
        }
        return acc;
      }, {});

      // Add meal type names to orders
      const ordersWithMealTypes = filteredOrders.map((order) => ({
        ...order,
        mealTypeName:
          mealTypeMap[order.mealTypeId?.toString()] ||
          `Unknown Meal Type ${order.mealTypeId}`,
      }));

      // Sort by order date and time (newest first)
      ordersWithMealTypes.sort((a, b) => {
        const dateA = new Date(
          a.orderPlacedTime
          
        );
        const dateB = new Date(
          b.orderPlacedTime 
        );
        return dateB - dateA;
      });

      // console.log("Final processed orders:", ordersWithMealTypes);
      return ordersWithMealTypes;
    } catch (error) {
      console.error("Error fetching individual employee orders:", error);
      message.error(`Failed to fetch employee orders: ${error.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to filter orders by time period for individual employee
  const filterOrdersByTimePeriod = (
    orders,
    period,
    customStartDate = null,
    customEndDate = null
  ) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          return orders;
        }
        break;
      default:
        return orders;
    }

    return orders.filter((order) => {
      const orderDate = new Date(order.orderDate || order.orderPlacedTime);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const generateEmployeeReportData = () => {
    if (!individualEmployeeData || individualEmployeeData.length === 0) {
      return [];
    }

    return individualEmployeeData.map((order, index) => ({
      key: (index + 1).toString(),
      date: formatDate(order.orderDate || order.order_date),
      mealType: order.mealTypeName || `Meal Type ${order.mealTypeId}`,
      orderTime: formatTime(order.orderPlacedTime || order.order_placed_time),
      status: determineOrderStatus(order, mealTypes), // Use the new logic
      price: `Rs. ${(order.price || 0).toFixed(2)}`,
      orderId: order.id,
      ...order, 
    }));
  };

  const determineOrderStatus = (order, mealTypes) => {
    // If order is already served, return 'Served'
    if (order.serve === true || order.served === true) {
      return "Served";
    }

    // Get order date
    const orderDate = new Date(order.orderDate || order.order_date);
    const today = new Date();

    // Set time to start of day for comparison
    const orderDateOnly = new Date(
      orderDate.getFullYear(),
      orderDate.getMonth(),
      orderDate.getDate()
    );
    const todayDateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // If order is from previous day, it's 'Not Served'
    if (orderDateOnly < todayDateOnly) {
      return "Not Served";
    }

    // If order is from today, check meal type end time
    if (orderDateOnly.getTime() === todayDateOnly.getTime()) {
      // Find the meal type for this order
      const mealType = mealTypes.find(
        (mt) =>
          mt.id === order.mealTypeId ||
          mt.mealTypeId === order.mealTypeId ||
          mt.meal_type_id === order.mealTypeId
      );

      if (
        mealType &&
        mealType.time &&
        Array.isArray(mealType.time) &&
        mealType.time.length >= 2
      ) {
        // Get end time 
        const endTime = mealType.time[1]; 

        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); 

        // Parse meal end time
        const [endHours, endMinutes] = endTime.split(":").map(Number);
        const mealEndTime = endHours * 60 + endMinutes; 

        // If current time has passed meal end time, it's 'Not Served'
        if (currentTime > mealEndTime) {
          return "Not Served";
        }
      }
    }

    
    return "Pending";
  };

  // Updated employee report table columns
  const employeeReportColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Meal Type",
      dataIndex: "mealType",
      key: "mealType",
      render: (text) => <span className={styles.mealTypeText}>{text}</span>,
    },
    {
      title: "Order Time",
      dataIndex: "orderTime",
      key: "orderTime",
      align: "center",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (text) => <span className={styles.priceText}>{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <span
          className={
            status === "Served"
              ? styles.statusBadgeServed
              : status === "Not Served"
              ? styles.statusBadgeNotServed // You'll need to add this CSS class
              : styles.statusBadgePending
          }
        >
          {status}
        </span>
      ),
    },
  ];

  // Calculate employee report summary
  const calculateEmployeeReportSummary = () => {
    if (!individualEmployeeData || individualEmployeeData.length === 0) {
      return {
        totalOrders: 0,
        servedOrders: 0,
        pendingOrders: 0,
        notServedOrders: 0,
        totalAmount: 0,
        efficiency: 0,
      };
    }

    const reportData = generateEmployeeReportData();
    const totalOrders = reportData.length;
    const servedOrders = reportData.filter(
      (order) => order.status === "Served"
    ).length;
    const pendingOrders = reportData.filter(
      (order) => order.status === "Pending"
    ).length;
    const notServedOrders = reportData.filter(
      (order) => order.status === "Not Served"
    ).length;

    const totalAmount = individualEmployeeData.reduce(
      (sum, order) => sum + (order.price || 0),
      0
    );
    const efficiency =
      totalOrders > 0 ? Math.round((servedOrders / totalOrders) * 100) : 0;

    return {
      totalOrders,
      servedOrders,
      pendingOrders,
      notServedOrders,
      totalAmount,
      efficiency,
    };
  };

  const handleGenerateEmployeeReport = async () => {
    console.log(
      `Generating employee report for ID: ${employeeId}, period: ${employeeTimePeriod}`
    );

    // Validate employee ID
    if (!employeeId || !employeeId.trim()) {
      message.error("Please enter an Employee No");
      return;
    }

    // Validate custom date range if selected
    if (employeeTimePeriod === "custom") {
      if (!employeeStartDate || !employeeEndDate) {
        message.error(
          "Please select both start date and end date for custom range"
        );
        return;
      }
      if (new Date(employeeStartDate) > new Date(employeeEndDate)) {
        message.error("Start date cannot be later than end date");
        return;
      }
    }

    try {
      // Convert empNo to userid 
      const res = await axios.get(`${urL}/user/empno/${employeeId}`, {
        params: { orgId: authData?.orgId },
        headers: { Authorization: `Bearer ${token}` },
      });
      const userId = res.data?.id;
      if (!userId) {
        message.error("No user found for this Employee No");
        setIndividualEmployeeData([]);
        return;
      }

      // Fetch individual employee orders with the selected time period
      const employeeOrders = await fetchIndividualEmployeeOrders(
        userId,
        employeeTimePeriod
      );
      setIndividualEmployeeData(employeeOrders);

      if (employeeOrders.length === 0) {
        message.info(
          `No orders found for Employee ID: ${employeeId} in the selected time period`
        );
      } else {
        message.success(
          `Employee report generated successfully for ${employeeId}!`
        );
      }
    } catch (error) {
      console.error("Error generating employee report:", error);
      message.error("Failed to generate employee report");
    }
  };

  useEffect(() => {
    if (employeeTimePeriod !== "custom") {
      setEmployeeStartDate("");
      setEmployeeEndDate("");
    }
  }, [employeeTimePeriod]);

  useEffect(() => {
    if (orderTimePeriod !== "custom") {
      setOrderStartDate("");
      setOrderEndDate("");
    }
  }, [orderTimePeriod]);

  useEffect(() => {
    if (activeTab !== "orders") {
      setOrderDetailsData([]);
    }
  }, [activeTab]);

  //End Employee Report..........

  //handle download
  const handleDownloadExcel = () => {
    let exportData = [];
    let fileName = "";
    let worksheetName = "";

    switch (activeTab) {
      case "summary":
        if (!employeeData || employeeData.length === 0) {
          message.warning("No summary data to export.");
          return;
        }

        // Prepare summary data for export (remove 'key' field and format prices)
        exportData = employeeData.map(({ key, ...rest }) => {
          const formattedData = { ...rest };

          // Format price fields to show actual values instead of objects
          Object.keys(formattedData).forEach((key) => {
            if (key.endsWith("_price")) {
              formattedData[key] = `Rs. ${(formattedData[key] || 0).toFixed(
                2
              )}`;
            }
          });

          // Format total amount
          if (formattedData.totalAmount) {
            formattedData.totalAmount = `Rs. ${formattedData.totalAmount.toFixed(
              2
            )}`;
          }

          return formattedData;
        });

        fileName = `Employee_Meal_Summary_${timePeriod}.xlsx`;
        worksheetName = "Summary Report";
        break;

      case "orders":
        if (!orderDetailsData || orderDetailsData.length === 0) {
          message.warning("No order details data to export.");
          return;
        }

        // Prepare order details data for export
        exportData = orderDetailsData.map(({ key, ...rest }) => ({
          ...rest,
          efficiency: `${rest.efficiency}%`,
        }));

        fileName = `Order_Details_Report_${orderTimePeriod}.xlsx`;
        worksheetName = "Order Details";
        break;

      case "employee":
        // This is a placeholder - you'll need to implement employee-specific data
        const employeeReportData = generateEmployeeReportData();

        if (!employeeReportData || employeeReportData.length === 0) {
          message.warning("No employee report data to export.");
          return;
        }

        exportData = employeeReportData.map(({ key, ...rest }) => rest);
        fileName = `Employee_Individual_Report_${
          employeeId || "All"
        }_${employeeTimePeriod}.xlsx`;
        worksheetName = "Employee Report";
        break;

      default:
        message.warning("Unknown report type.");
        return;
    }

    try {
      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

      // Generate Excel file and trigger download
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, fileName);

      message.success(`${worksheetName} exported successfully!`);
    } catch (error) {
      console.error("Error generating Excel file:", error);
      message.error("Failed to generate Excel file.");
    }
  };

  //End  handle download...

  useEffect(() => {
    // Clear data when time period changes, requiring manual report generation
    if (timePeriod !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  }, [timePeriod]);

  return (
    <div className={styles.container}>
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
          style={{ marginBottom: "30px" }}
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
            <div style={{ marginBottom: "40px" }}>
              <div className={styles.tabContentHeader}>
                <div>
                  <h2 className={styles.tabTitle}>
                    Employee Meal Consumption Summary
                  </h2>
                  <p className={styles.tabDescription}>
                    Overview of meal consumption by employee including meal
                    types and total costs based on actual order prices
                  </p>
                </div>
              </div>

              <div className={styles.controlsContainer}>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>Time Period</label>
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
                {timePeriod === "custom" && (
                  <>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>Start Date</label>
                      <input
                        type="date"
                        className={styles.dateInput}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={endDate || undefined}
                      />
                    </div>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>End Date</label>
                      <input
                        type="date"
                        className={styles.dateInput}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || undefined}
                      />
                    </div>
                  </>
                )}
                <Button
                  type="primary"
                  onClick={handleGenerateReport}
                  className={styles.generateButtonDark}
                  loading={loading}
                  disabled={timePeriod === "custom" && (!startDate || !endDate)}
                >
                  {loading ? "Loading..." : "Generate Report"}
                </Button>
              </div>

              <Spin spinning={loading}>
                <Table
                  columns={columns}
                  dataSource={employeeData}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} employees`,
                  }}
                  className={styles.table}
                  bordered
                  locale={{
                    emptyText: loading
                      ? "Loading data..."
                      : employeeData.length === 0 && activeTab === "summary"
                      ? "Click 'Generate Report' to view summary data"
                      : "No data available for the selected time period",
                  }}
                  summary={
                    employeeData.length > 0
                      ? () => (
                          <Table.Summary.Row className={styles.summaryRow}>
                            {generateSummaryRow()}
                          </Table.Summary.Row>
                        )
                      : undefined
                  }
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
                    efficiency metrics grouped by meal type
                  </p>
                </div>
              </div>

              <div className={styles.controlsContainer}>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>Time Period</label>
                  <Select
                    value={orderTimePeriod}
                    onChange={setOrderTimePeriod}
                    className={styles.selectInput}
                    loading={loading}
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
                      <input
                        type="date"
                        className={styles.dateInput}
                        value={orderStartDate}
                        onChange={(e) => setOrderStartDate(e.target.value)}
                      />
                    </div>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>End Date</label>
                      <input
                        type="date"
                        className={styles.dateInput}
                        value={orderEndDate}
                        onChange={(e) => setOrderEndDate(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <Button
                  type="primary"
                  onClick={handleGenerateOrderDetailsReport}
                  className={styles.generateButtonDark}
                  loading={loading}
                >
                  {loading ? "Loading..." : "Generate Report"}
                </Button>
              </div>

              <Spin spinning={loading}>
                <Table
                  columns={[
                    {
                      title: "Meal Type",
                      dataIndex: "mealType",
                      key: "mealType",
                      width: 200,
                      render: (text) => (
                        <div className={styles.mealTypeCell}>
                          <strong>{text}</strong>
                        </div>
                      ),
                    },
                    {
                      title: "Total Orders",
                      dataIndex: "orderCount",
                      key: "orderCount",
                      width: 150,
                      align: "center",
                      render: (value) => (
                        <div className={styles.orderCountCell}>
                          <span className={styles.orderCountValue}>
                            {value}
                          </span>
                          <div className={styles.orderCountLabel}>Orders</div>
                        </div>
                      ),
                    },
                    {
                      title: "Orders Served",
                      dataIndex: "serveCount",
                      key: "serveCount",
                      width: 150,
                      align: "center",
                      render: (value) => (
                        <div className={styles.serveCountCell}>
                          <span className={styles.serveCountValue}>
                            {value}
                          </span>
                          <div className={styles.serveCountLabel}>Served</div>
                        </div>
                      ),
                    },
                    {
                      title: "Served Percentage",
                      dataIndex: "efficiency",
                      key: "efficiency",
                      width: 150,
                      align: "center",
                      render: (value) => (
                        <div className={styles.efficiencyCell}>
                          <span
                            className={
                              value >= 90
                                ? styles.efficiencyBadgeExcellent
                                : value >= 80
                                ? styles.efficiencyBadgeGood
                                : styles.efficiencyBadgePoor
                            }
                          >
                            {value}%
                          </span>
                        </div>
                      ),
                    },
                  ]}
                  dataSource={orderDetailsData}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} meal types`,
                  }}
                  className={styles.table}
                  bordered
                  locale={{
                    emptyText: loading
                      ? "Loading order details..."
                      : orderDetailsData.length === 0 && activeTab === "orders"
                      ? "Click 'Generate Report' to view order details data"
                      : "No order data available for the selected time period",
                  }}
                  summary={() => {
                    if (orderDetailsData.length === 0) return null;

                    const totalOrders = orderDetailsData.reduce(
                      (sum, item) => sum + item.orderCount,
                      0
                    );
                    const totalServed = orderDetailsData.reduce(
                      (sum, item) => sum + item.serveCount,
                      0
                    );
                    const overallEfficiency =
                      totalOrders > 0
                        ? Math.round((totalServed / totalOrders) * 100)
                        : 0;

                    return (
                      <Table.Summary.Row className={styles.summaryRow}>
                        <Table.Summary.Cell index={0}>
                          <strong>Total Summary</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="center">
                          <div className={styles.summaryCell}>
                            <strong>{totalOrders}</strong>
                            <div>Total Orders</div>
                          </div>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} align="center">
                          <div className={styles.summaryCell}>
                            <strong>{totalServed}</strong>
                            <div>Total Served</div>
                          </div>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3} align="center">
                          <div className={styles.summaryCell}>
                            <strong
                              className={
                                overallEfficiency >= 98
                                  ? styles.efficiencyBadgeExcellent
                                  : overallEfficiency >= 95
                                  ? styles.efficiencyBadgeGood
                                  : styles.efficiencyBadgePoor
                              }
                            >
                              {overallEfficiency}%
                            </strong>
                            <div>Overall served %</div>
                          </div>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Spin>
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
                  <label className={styles.controlLabel}>Employee No</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Enter Employee No"
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
                        value={employeeStartDate}
                        onChange={(e) => setEmployeeStartDate(e.target.value)}
                        className={styles.dateInput}
                      />
                    </div>
                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>End Date</label>
                      <input
                        type="date"
                        value={employeeEndDate}
                        onChange={(e) => setEmployeeEndDate(e.target.value)}
                        className={styles.dateInput}
                      />
                    </div>
                  </>
                )}
                <Button
                  type="primary"
                  onClick={handleGenerateEmployeeReport}
                  className={styles.generateButtonDark}
                  loading={loading}
                >
                  {loading ? "Loading..." : "Generate Report"}
                </Button>
              </div>

              {/* Employee Summary Section */}
              <Spin spinning={loading}>
                <Table
                  columns={employeeReportColumns}
                  dataSource={generateEmployeeReportData()}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} orders`,
                  }}
                  className={styles.table}
                  bordered
                  locale={{
                    emptyText: loading
                      ? "Loading employee data..."
                      : employeeId
                      ? `No orders found for Employee ID: ${employeeId} in the selected time period`
                      : "Enter an Employee ID and click Generate Report to view order details",
                  }}
                  summary={() => {
                    const reportData = generateEmployeeReportData();
                    if (reportData.length === 0) return null;

                    const summary = calculateEmployeeReportSummary();

                    return (
                      <Table.Summary.Row className={styles.summaryRow}>
                        <Table.Summary.Cell index={0} colSpan={2}>
                          <strong>Summary Total</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} align="center">
                          <strong>{summary.totalOrders} Orders</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3} align="center">
                          <strong>Rs. {summary.totalAmount.toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4} align="center">
                          <strong>
                            {summary.servedOrders} Served /{" "}
                            {summary.pendingOrders} Pending /{" "}
                            {summary.notServedOrders} Not Served
                          </strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Spin>
            </div>
          </TabPane>
        </Tabs>

        <div className={styles.downloadSection}>
          <Button
            type="default"
            icon={<Download size={16} />}
            className={styles.downloadButton}
            onClick={handleDownloadExcel}
          >
            Download Excel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Report;
