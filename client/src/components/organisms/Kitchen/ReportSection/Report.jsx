import React, { useState, useEffect } from "react";
import {
  Card,
  Progress,
  Table,
  Tabs,
  Button,
  Select,
  Spin,
  message,
} from "antd";
import {
  BarChart3,
  FileText,
  Users,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import styles from "./Report.module.css";
import { useAuth } from "../../../../contexts/AuthContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { TabPane } = Tabs;
const { Option } = Select;

const Report = () => {
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

  // API calls without authentication
  const fetchOrders = async () => {
    try {
      console.log("Fetching orders...");

      const response = await fetch("http://localhost:3000/orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Orders response status:", response.status);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch orders: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Fetched orders:", data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error(`Failed to fetch orders: ${error.message}`);
      return [];
    }
  };

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
        // For employee report, we need to implement the data structure first
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

  const processOrderDetailsData = (orders, mealTypes) => {
    if (!orders || !mealTypes) return [];

    console.log("Processing order details with:", {
      ordersCount: orders.length,
      mealTypesCount: mealTypes.length,
    });

    // Create meal type lookup by ID to get the name
    const mealTypeMap = mealTypes.reduce((acc, mealType) => {
      const mealId =
        mealType.id || mealType.mealTypeId || mealType.meal_type_id;
      const mealName =
        mealType.name ||
        mealType.mealTypeName ||
        mealType.meal_type_name ||
        mealType.type ||
        `Meal Type ${mealId}`;

      if (mealId) {
        acc[mealId] = mealName;
        acc[mealId.toString()] = mealName;
      }
      return acc;
    }, {});

    console.log("Meal type mapping:", mealTypeMap);

    // Group orders by meal type name (not ID)
    const groupedByMealType = {};

    orders.forEach((order) => {
      const mealTypeId =
        order.mealTypeId || order.meal_type_id || order.mealType;
      const mealTypeName =
        mealTypeMap[mealTypeId] ||
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

      // Check if order was served (you can modify this logic based on your serve status field)
      if (
        order.served === true ||
        order.status === "served" ||
        order.orderStatus === "served"
      ) {
        groupedByMealType[mealTypeName].servedOrders += 1;
      }
    });

    console.log("Grouped by meal type:", groupedByMealType);

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

    console.log("Final order details data:", details);
    return details.sort((a, b) => b.orderCount - a.orderCount); // Sort by order count descending
  };

  const fetchEmployees = async () => {
    try {
      console.log("Fetching users/employees...");

      const response = await fetch("http://localhost:3000/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Users response status:", response.status);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch users: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Fetched users/employees:", data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching users/employees:", error);
      message.error(`Failed to fetch employees: ${error.message}`);
      return [];
    }
  };

  const fetchMealTypes = async () => {
    try {
      console.log("Fetching meal types...");

      const response = await fetch("http://localhost:3000/meal-types", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Meal types response status:", response.status);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch meal types: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Fetched meal types:", data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching meal types:", error);
      message.error(`Failed to fetch meal types: ${error.message}`);
      return [];
    }
  };

  // Enhanced data processing with actual order prices
  const processEmployeeMealData = (orders, employees, mealTypes) => {
    console.log("Processing data with:", {
      ordersCount: orders?.length || 0,
      employeesCount: employees?.length || 0,
      mealTypesCount: mealTypes?.length || 0,
    });

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
      const userId = user.id || user.userId || user.user_id;
      const userName =
        user.name ||
        user.userName ||
        user.user_name ||
        user.fullName ||
        user.full_name ||
        user.firstName ||
        user.first_name ||
        (user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : null) ||
        (user.first_name && user.last_name
          ? `${user.first_name} ${user.last_name}`
          : null) ||
        user.username ||
        user.email?.split("@")[0] ||
        `User ${userId}`;

      if (userId) {
        acc[userId] = userName;
        acc[userId.toString()] = userName;
        if (!isNaN(userId)) {
          acc[parseInt(userId)] = userName;
        }
      }

      console.log(`Mapped user: UserID=${userId}, UserName=${userName}`);
      return acc;
    }, {});

    // Create meal type lookup map
    const mealTypeMap = mealTypes.reduce((acc, mealType) => {
      const mealId =
        mealType.id || mealType.mealTypeId || mealType.meal_type_id;
      const mealName =
        mealType.name ||
        mealType.mealTypeName ||
        mealType.meal_type_name ||
        mealType.type ||
        `Meal Type ${mealId}`;

      if (mealId) {
        acc[mealId] = mealName.toLowerCase();
        acc[mealId.toString()] = mealName.toLowerCase();
        if (!isNaN(mealId)) {
          acc[parseInt(mealId)] = mealName.toLowerCase();
        }
      }
      return acc;
    }, {});

    console.log("User lookup map (UserID -> UserName):", employeeMap);
    console.log("Meal type map:", mealTypeMap);

    // Get unique employee IDs from orders
    const uniqueEmployeeIds = [
      ...new Set(
        orders.map((order) => {
          const empId =
            order.employeeId ||
            order.employee_id ||
            order.userId ||
            order.user_id;
          console.log(`Order employee ID: ${empId} (type: ${typeof empId})`);
          return empId;
        })
      ),
    ].filter((id) => id !== null && id !== undefined);

    console.log("Unique employee IDs from orders:", uniqueEmployeeIds);

    // Get unique meal types from orders
    const uniqueMealTypeIds = [
      ...new Set(
        orders.map(
          (order) => order.mealTypeId || order.meal_type_id || order.mealType
        )
      ),
    ].filter((id) => id !== null && id !== undefined);

    const dynamicMealTypes = uniqueMealTypeIds.map((mealTypeId) => {
      const mealTypeName =
        mealTypeMap[mealTypeId] ||
        mealTypeMap[mealTypeId.toString()] ||
        mealTypeMap[parseInt(mealTypeId)] ||
        `meal_type_${mealTypeId}`;
      return {
        id: mealTypeId,
        name: mealTypeName,
        displayName:
          mealTypeName.charAt(0).toUpperCase() + mealTypeName.slice(1),
      };
    });

    console.log("Dynamic meal types:", dynamicMealTypes);

    // Initialize employee meal counts and prices
    const employeeMealCounts = {};

    // Initialize all employees who have orders
    uniqueEmployeeIds.forEach((empId) => {
      if (empId !== null && empId !== undefined) {
        const userName =
          employeeMap[empId] ||
          employeeMap[empId.toString()] ||
          employeeMap[parseInt(empId)] ||
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
        console.log(
          `Initialized employee record with user name:`,
          employeeRecord
        );
      }
    });

    // Process orders and count meals with actual prices
    orders.forEach((order) => {
      const employeeId =
        order.employeeId || order.employee_id || order.userId || order.user_id;
      const mealTypeId =
        order.mealTypeId || order.meal_type_id || order.mealType;
      const orderPrice = parseFloat(order.price) || 0; // Get actual price from order

      if (employeeId && mealTypeId && employeeMealCounts[employeeId]) {
        const mealTypeName =
          mealTypeMap[mealTypeId] ||
          mealTypeMap[mealTypeId.toString()] ||
          mealTypeMap[parseInt(mealTypeId)];

        console.log(
          `Processing order: Employee ${employeeId}, Meal Type ID: ${mealTypeId}, Meal Type Name: ${mealTypeName}, Price: ${orderPrice}`
        );

        // Get the count of meals from the meals array or default to 1
        let mealCount = 1;
        if (order.meals && Array.isArray(order.meals)) {
          mealCount = order.meals.length;
        } else if (order.meals && typeof order.meals === "string") {
          mealCount = order.meals.split(",").length;
        } else if (order.quantity && !isNaN(order.quantity)) {
          mealCount = parseInt(order.quantity);
        }

        // Increment meal count and add price based on meal type
        if (
          mealTypeName &&
          employeeMealCounts[employeeId][mealTypeName] !== undefined
        ) {
          employeeMealCounts[employeeId][mealTypeName] += mealCount;
          employeeMealCounts[employeeId][`${mealTypeName}_price`] += orderPrice; // Add actual order price
          employeeMealCounts[employeeId].totalMeals += mealCount;
          employeeMealCounts[employeeId].totalAmount += orderPrice; // Add to total amount
        } else {
          // If meal type name not found, still count total meals and amount
          employeeMealCounts[employeeId].totalMeals += mealCount;
          employeeMealCounts[employeeId].totalAmount += orderPrice;
        }
      }
    });

    // Convert to array and add keys
    const processedData = Object.values(employeeMealCounts).map(
      (employee, index) => ({
        key: (index + 1).toString(),
        ...employee,
      })
    );

    console.log("Final processed data:", processedData);
    return { processedData, dynamicMealTypes };
  };

  // Filter data based on time period
  const filterDataByTimePeriod = (orders, period) => {
    const now = new Date();
    let startDate;

    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return orders;
    }

    return orders.filter((order) => {
      const orderDate = new Date(
        order.orderDate ||
          order.order_date ||
          order.createdAt ||
          order.created_at
      );
      return orderDate >= startDate;
    });
  };

  // Load data function
  const loadData = async () => {
    setLoading(true);
    try {
      console.log("Starting data load...");

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

      console.log("Data fetch results:", {
        orders: { status: ordersData.status, count: orders.length },
        employees: { status: employeesData.status, count: employees.length },
        mealTypes: { status: mealTypesData.status, count: mealTypes.length },
      });

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
        const filteredOrders = filterDataByTimePeriod(orders, timePeriod);
        console.log("Filtered orders:", filteredOrders.length);

        const result = processEmployeeMealData(
          filteredOrders,
          employees,
          mealTypes
        );

        if (result && result.processedData) {
          setEmployeeData(result.processedData);

          if (result.processedData.length === 0) {
            message.info("No data found for the selected time period");
          } else {
            message.success(
              `Loaded ${result.processedData.length} employee records`
            );
          }
        } else {
          setEmployeeData([]);
          message.warning("Unable to process data.");
        }
      } else {
        setEmployeeData([]);
        message.info("No order data available");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      message.error("Failed to load report data");
      setEmployeeData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when time period changes
  useEffect(() => {
    loadData();
  }, [timePeriod]);

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

  // Table columns definition
  const columns = [
    {
      title: "Employee ID",
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

  // Calculate meal popularity for analysis
  const calculateMealPopularity = () => {
    if (totals.totalMeals === 0) return { highDemand: [], lowDemand: [] };

    const mealStats = (totals.mealTypeKeys || []).map((mealType) => ({
      name: mealType.charAt(0).toUpperCase() + mealType.slice(1),
      count: totals[mealType] || 0,
      percentage: Math.round(
        ((totals[mealType] || 0) / totals.totalMeals) * 100
      ),
    }));

    mealStats.sort((a, b) => b.percentage - a.percentage);

    const highDemand = mealStats.filter((meal) => meal.percentage > 30);
    const lowDemand = mealStats.filter((meal) => meal.percentage <= 30);

    return { highDemand, lowDemand };
  };

  const { highDemand, lowDemand } = calculateMealPopularity();

  const handleGenerateReport = () => {
    console.log(`Generating ${timePeriod} report...`);
    loadData();
    message.success(
      `${
        timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)
      } report generated successfully!`
    );
  };

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

  const handleGenerateOrderDetailsReport = async () => {
    setLoading(true);
    try {
      console.log(
        "Generating order details report for period:",
        orderTimePeriod
      );

      // Use already fetched data if available, otherwise fetch fresh data
      let ordersData = orders;
      let mealTypesData = mealTypes;

      if (!ordersData.length || !mealTypesData.length) {
        console.log("Fetching fresh data...");
        const [ordersResult, mealTypesResult] = await Promise.allSettled([
          fetchOrders(),
          fetchMealTypes(),
        ]);

        ordersData =
          ordersResult.status === "fulfilled" ? ordersResult.value : [];
        mealTypesData =
          mealTypesResult.status === "fulfilled" ? mealTypesResult.value : [];
      }

      console.log("Using data:", {
        orders: ordersData.length,
        mealTypes: mealTypesData.length,
      });

      // Filter orders by selected time period
      const filteredOrders = filterOrdersByPeriod(ordersData, orderTimePeriod);
      console.log("Filtered orders:", filteredOrders.length);

      // Process the filtered orders
      const details = processOrderDetailsData(filteredOrders, mealTypesData);

      setOrderDetailsData(details);

      if (details.length === 0) {
        message.info("No order data found for the selected time period");
      } else {
        message.success(
          `Order details report generated! Found ${details.length} meal types.`
        );
      }
    } catch (error) {
      console.error("Error generating order details report:", error);
      message.error("Failed to generate order details report");
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByPeriod = (orders, period) => {
    const now = new Date();
    let startDate;

    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return orders;
    }

    console.log("Filtering orders from:", startDate.toISOString());

    return orders.filter((order) => {
      const orderDate = new Date(
        order.orderDate ||
          order.order_date ||
          order.createdAt ||
          order.created_at ||
          order.orderPlacedTime
      );

      const isInRange = orderDate >= startDate;
      if (!isInRange) {
        console.log("Order excluded:", {
          orderDate: orderDate.toISOString(),
          startDate: startDate.toISOString(),
        });
      }
      return isInRange;
    });
  };

  // Load order details data on component mount and when orderTimePeriod changes
  useEffect(() => {
    if (activeTab === "orders") {
      handleGenerateOrderDetailsReport();
    }
  }, [orderTimePeriod, activeTab]);

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
                    <span>
                      {meal.name} ({meal.count} orders)
                    </span>
                    <span className={styles.highDemandPercentage}>
                      {meal.percentage}%
                    </span>
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
                    <span>
                      {meal.name} ({meal.count} orders)
                    </span>
                    <span className={styles.lowDemandPercentage}>
                      {meal.percentage}%
                    </span>
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
          style={{ marginBottom: "24px" }}
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
            <div style={{ marginBottom: "24px" }}>
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
                  onClick={handleGenerateReport}
                  className={styles.generateButtonDark}
                  loading={loading}
                >
                  {loading ? "Loading..." : "Generate Report"}
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
                    emptyText: loading
                      ? "Loading data..."
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
                      title: "Efficiency",
                      dataIndex: "efficiency",
                      key: "efficiency",
                      width: 150,
                      align: "center",
                      render: (value) => (
                        <div className={styles.efficiencyCell}>
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
                          <div className={styles.efficiencyLabel}>
                            {value >= 98
                              ? "Excellent"
                              : value >= 95
                              ? "Good"
                              : "Needs Improvement"}
                          </div>
                        </div>
                      ),
                    },
                  ]}
                  dataSource={orderDetailsData}
                  pagination={false}
                  className={styles.table}
                  bordered
                  locale={{
                    emptyText: loading
                      ? "Loading order details..."
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
                            <div>Overall Efficiency</div>
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
