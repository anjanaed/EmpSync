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
  const [highestDemandMeal, setHighestDemandMeal] = useState(null);
  const [lowestDemandMeal, setLowestDemandMeal] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderStartDate, setOrderStartDate] = useState("");
  const [orderEndDate, setOrderEndDate] = useState("");
  const [employeeStartDate, setEmployeeStartDate] = useState("");
  const [employeeEndDate, setEmployeeEndDate] = useState("");

  useEffect(() => {
    const loadAnalyzeData = async () => {
      const { highestDemand, lowestDemand } = await analyzeMealOrders();
      setHighestDemandMeal(highestDemand);
      setLowestDemandMeal(lowestDemand);
    };

    if (authData?.orgId) {
      loadAnalyzeData();
    }
  }, [authData?.orgId]);

  // Function to fetch meals data
  const fetchMeals = async () => {
    try {
      console.log("Fetching meals data...");
      const response = await axios.get(`${urL}/meal`, {
        params: {
          orgId: authData?.orgId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching meals:", error);
      message.error(`Failed to fetch meals: ${error.message}`);
      return [];
    }
  };

  // Function to analyze meal orders and get single highest and lowest demand meals
  const analyzeMealOrders = async () => {
    try {
      setLoading(true);

      // Fetch orders and meals data
      const [ordersData, mealsData] = await Promise.allSettled([
        fetchOrders(),
        fetchMeals(),
      ]);

      const orders = ordersData.status === "fulfilled" ? ordersData.value : [];
      const meals = mealsData.status === "fulfilled" ? mealsData.value : [];

      console.log("Orders data:", orders.length);
      console.log("Meals data:", meals.length);

      if (orders.length === 0) {
        console.log("No orders found");
        return { highestDemand: null, lowestDemand: null };
      }

      // Extract and count meal IDs from orders
      const mealOrderCounts = {};

      orders.forEach((order) => {
        const mealsArray = order.meals || [];

        mealsArray.forEach((mealString) => {
          // Parse meal string format "mealId:quantity"
          const [mealId, quantity] = mealString.split(":");
          const parsedMealId = parseInt(mealId);
          const parsedQuantity = parseInt(quantity) || 1;

          if (!isNaN(parsedMealId)) {
            mealOrderCounts[parsedMealId] =
              (mealOrderCounts[parsedMealId] || 0) + parsedQuantity;
          }
        });
      });

      console.log("Meal order counts:", mealOrderCounts);

      // Convert to array and sort by count (descending)
      const sortedMealCounts = Object.entries(mealOrderCounts)
        .map(([mealId, count]) => ({
          mealId: parseInt(mealId),
          count: count,
        }))
        .sort((a, b) => b.count - a.count);

      console.log("Sorted meal counts:", sortedMealCounts);

      if (sortedMealCounts.length === 0) {
        return { highestDemand: null, lowestDemand: null };
      }

      // Create meals lookup map for efficient meal name retrieval
      const mealsLookup = {};
      meals.forEach((meal) => {
        const mealId = meal.id || meal.mealId;
        const mealName = meal.nameEnglish;

        if (mealId) {
          mealsLookup[mealId] = mealName;
        }
      });

      console.log("Meals lookup:", mealsLookup);

      // Function to get meal name by ID using lookup
      const getMealNameById = (mealId) => {
        return mealsLookup[mealId] || `Unknown Meal ${mealId}`;
      };

      // Calculate total orders for percentage calculation
      const totalOrders = sortedMealCounts.reduce((sum, m) => sum + m.count, 0);

      // Get highest demand meal (first in sorted array)
      const highestDemandMeal = sortedMealCounts[0];
      const highestDemand = {
        mealId: highestDemandMeal.mealId,
        name: getMealNameById(highestDemandMeal.mealId),
        count: highestDemandMeal.count,
        percentage: Math.round((highestDemandMeal.count / totalOrders) * 100),
      };

      // Get lowest demand meal (last in sorted array)
      const lowestDemandMeal = sortedMealCounts[sortedMealCounts.length - 1];
      const lowestDemand = {
        mealId: lowestDemandMeal.mealId,
        name: getMealNameById(lowestDemandMeal.mealId),
        count: lowestDemandMeal.count,
        percentage: Math.round((lowestDemandMeal.count / totalOrders) * 100),
      };

      console.log("Highest demand meal:", highestDemand);
      console.log("Lowest demand meal:", lowestDemand);

      return { highestDemand, lowestDemand };
    } catch (error) {
      console.error("Error analyzing meal orders:", error);
      message.error("Failed to analyze meal orders");
      return { highestDemand: null, lowestDemand: null };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAnalyzeData = async () => {
      const { mostOrdered, leastOrdered } = await analyzeMealOrders();
      setMostOrderedMeals(mostOrdered);
      setLeastOrderedMeals(leastOrdered);
    };

    loadAnalyzeData();
  }, [authData?.orgId]);

  const generateEmployeeReportData = () => {
    if (!individualEmployeeData || individualEmployeeData.length === 0) {
      return [];
    }

    return individualEmployeeData.map((order, index) => ({
      key: (index + 1).toString(),
      date: formatDate(order.orderDate || order.order_date),
      mealType: order.mealTypeName || `Meal Type ${order.mealTypeId}`,
      orderTime: formatTime(order.orderPlacedTime || order.order_placed_time),
      status: order.serve || order.served ? "Served" : "Pending",
      price: `Rs. ${(order.price || 0).toFixed(2)}`,
      orderId: order.id,
      ...order, // Include all order data for potential future use
    }));
  };

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
          employeeId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allOrders = Array.isArray(response.data) ? response.data : [];
      console.log("All orders fetched:", allOrders.length);

      // Filter orders by employee ID
      const employeeOrders = allOrders.filter((order) => {
        const orderEmployeeId =
          order.employeeId ||
          order.employee_id ||
          order.userId ||
          order.user_id;
        return (
          orderEmployeeId &&
          orderEmployeeId.toString() === employeeId.toString()
        );
      });

      console.log(`Orders for employee ${employeeId}:`, employeeOrders.length);

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
      console.log(`Orders after time filter:`, filteredOrders.length);

      // Get meal types to map meal type IDs to names
      let mealTypesData = mealTypes;

      if (!mealTypesData || mealTypesData.length === 0) {
        try {
          const mealTypesResponse = await axios.get(`${urL}/meal-types`, {
            params: {
              orgId: authData?.orgId,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          mealTypesData = mealTypesResponse.data;
        } catch (error) {
          console.error("Error fetching meal types:", error);
        }
      }

      // Create meal type lookup
      const mealTypeMap = mealTypesData.reduce((acc, mealType) => {
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

      // Add meal type names to orders
      const ordersWithMealTypes = filteredOrders.map((order) => ({
        ...order,
        mealTypeName:
          mealTypeMap[order.mealTypeId] ||
          mealTypeMap[order.mealTypeId?.toString()] ||
          `Unknown Meal Type ${order.mealTypeId}`,
      }));

      // Sort by order date and time (newest first)
      ordersWithMealTypes.sort((a, b) => {
        const dateA = new Date(
          a.orderPlacedTime ||
            a.order_placed_time ||
            a.orderDate ||
            a.order_date
        );
        const dateB = new Date(
          b.orderPlacedTime ||
            b.order_placed_time ||
            b.orderDate ||
            b.order_date
        );
        return dateB - dateA;
      });

      console.log("Final processed orders:", ordersWithMealTypes);
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
      const orderDate = new Date(
        order.orderDate ||
          order.order_date ||
          order.orderPlacedTime ||
          order.order_placed_time ||
          order.createdAt ||
          order.created_at
      );
      return orderDate >= startDate && orderDate <= endDate;
    });
  };
  // Function to get employee name from ID
  const getEmployeeName = (employeeId) => {
    if (!employees || employees.length === 0) return null;

    const employee = employees.find((emp) => {
      const empId = emp.id || emp.userId || emp.user_id;
      return empId && empId.toString() === employeeId.toString();
    });

    if (employee) {
      return (
        employee.name ||
        employee.userName ||
        employee.user_name ||
        employee.fullName ||
        employee.full_name ||
        employee.firstName ||
        employee.first_name ||
        (employee.firstName && employee.lastName
          ? `${employee.firstName} ${employee.lastName}`
          : null) ||
        (employee.first_name && employee.last_name
          ? `${employee.first_name} ${employee.last_name}`
          : null) ||
        employee.username ||
        employee.email?.split("@")[0] ||
        null
      );
    }

    return null;
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
      // width: 150,
      render: (text) => <span className={styles.mealTypeText}>{text}</span>,
    },
    {
      title: "Order Time",
      dataIndex: "orderTime",
      key: "orderTime",
      // width: 120,
      align: "center",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      // width: 100,
      align: "center",
      render: (text) => <span className={styles.priceText}>{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      // width: 120,
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
  ];

  // Calculate employee report summary
  const calculateEmployeeReportSummary = () => {
    if (!individualEmployeeData || individualEmployeeData.length === 0) {
      return {
        totalOrders: 0,
        servedOrders: 0,
        pendingOrders: 0,
        totalAmount: 0,
        efficiency: 0,
      };
    }

    const totalOrders = individualEmployeeData.length;
    const servedOrders = individualEmployeeData.filter(
      (order) => order.serve || order.served
    ).length;
    const pendingOrders = totalOrders - servedOrders;
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
      totalAmount,
      efficiency,
    };
  };

  // API calls without authentication
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

      if (order.serve === true) {
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

  const fetchMealTypes = async () => {
    try {
      console.log("Fetching meal types...");
      const response = await axios.get(`${urL}/meal-types`, {
        params: {
          orgId: authData?.orgId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching meal types:", error);
      message.error(`Failed to fetch meal types: ${error.message}`);
      return [];
    }
  };

  // Enhanced data processing with actual order prices
  // Enhanced data processing with actual order prices - FIXED VERSION
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

    // Process orders and count meals with actual prices - FIXED SECTION
    orders.forEach((order) => {
      const employeeId =
        order.employeeId || order.employee_id || order.userId || order.user_id;
      const mealTypeId =
        order.mealTypeId || order.meal_type_id || order.mealType;

      // FIXED: Properly parse the price from the order
      const orderPrice = parseFloat(order.price || 0);

      console.log(`Processing order:`, {
        employeeId,
        mealTypeId,
        orderPrice,
        rawPrice: order.price,
        orderData: order,
      });

      if (employeeId && mealTypeId && employeeMealCounts[employeeId]) {
        const mealTypeName =
          mealTypeMap[mealTypeId] ||
          mealTypeMap[mealTypeId.toString()] ||
          mealTypeMap[parseInt(mealTypeId)];

        console.log(
          `Processing order: Employee ${employeeId}, Meal Type ID: ${mealTypeId}, Meal Type Name: ${mealTypeName}, Price: ${orderPrice}`
        );

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
        } else if (order.quantity && !isNaN(order.quantity)) {
          mealCount = parseInt(order.quantity);
        }

        // FIXED: Increment meal count and add price based on meal type
        if (
          mealTypeName &&
          employeeMealCounts[employeeId][mealTypeName] !== undefined
        ) {
          employeeMealCounts[employeeId][mealTypeName] += mealCount;

          // FIXED: Add the actual order price (not multiplied by meal count since price is total)
          employeeMealCounts[employeeId][`${mealTypeName}_price`] += orderPrice;
          employeeMealCounts[employeeId].totalMeals += mealCount;
          employeeMealCounts[employeeId].totalAmount += orderPrice;

          console.log(`Updated employee ${employeeId}:`, {
            mealType: mealTypeName,
            mealCount: employeeMealCounts[employeeId][mealTypeName],
            mealPrice: employeeMealCounts[employeeId][`${mealTypeName}_price`],
            totalAmount: employeeMealCounts[employeeId].totalAmount,
          });
        } else {
          // If meal type name not found, still count total meals and amount
          employeeMealCounts[employeeId].totalMeals += mealCount;
          employeeMealCounts[employeeId].totalAmount += orderPrice;

          console.log(`Unknown meal type for employee ${employeeId}:`, {
            mealTypeId,
            mealTypeName,
            totalAmount: employeeMealCounts[employeeId].totalAmount,
          });
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

    console.log("Final processed data with prices:", processedData);

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
        order.orderDate ||
          order.order_date ||
          order.createdAt ||
          order.created_at
      );
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  // Load data function
  const loadData = async (customStartDate = null, customEndDate = null) => {
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
        const filteredOrders = filterDataByTimePeriod(
          orders,
          timePeriod,
          customStartDate,
          customEndDate
        );
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
          }
        } else {
          setEmployeeData([]);
          message.warning("Unable to process data.");
        }
      } else {
        setEmployeeData([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      message.error("Failed to load report data");
      setEmployeeData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear data when time period changes, requiring manual report generation
    if (timePeriod !== "custom") {
      setStartDate("");
      setEndDate("");
    }
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
    console.log("Generating order details report for period:", orderTimePeriod);

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
        order.orderDate ||
          order.order_date ||
          order.createdAt ||
          order.created_at ||
          order.orderPlacedTime
      );

      const isInRange = orderDate >= startDate && orderDate <= endDate;
      if (!isInRange) {
        console.log("Order excluded:", {
          orderDate: orderDate.toISOString(),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
      }
      return isInRange;
    });
  };

  const handleGenerateEmployeeReport = async () => {
    console.log(
      `Generating employee report for ID: ${employeeId}, period: ${employeeTimePeriod}`
    );

    // Validate employee ID
    if (!employeeId || !employeeId.trim()) {
      message.error("Please enter an Employee ID");
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
      // Fetch individual employee orders with the selected time period
      const employeeOrders = await fetchIndividualEmployeeOrders(
        employeeId,
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

  return (
    <div className={styles.container}>
      {/* Analysis Section */}

      <div className={styles.analysisSection}>
        <div className={styles.sectionHeader}>
          <TrendingUp className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Meal Demand Analysis</h2>
        </div>

        <div className={styles.analysisGrid}>
          <Card
            title={
              <div className={styles.cardTitle}>
                <TrendingUp className={styles.highDemandIcon} size={18} />
                Highest Demand Meal
              </div>
            }
            className={styles.card}
            loading={loading}
          >
            {highestDemandMeal ? (
              <div className={styles.mealItem}>
                <div className={styles.mealHeader}>
                  <span className={styles.mealName}>
                    {highestDemandMeal.name}
                  </span>
                  <span className={styles.mealStats}>
                    {highestDemandMeal.count} orders (
                    {highestDemandMeal.percentage}%)
                  </span>
                </div>
                <Progress
                  percent={highestDemandMeal.percentage}
                  strokeColor="#52c41a"
                  trailColor="#f0f0f0"
                  showInfo={false}
                />
                <div className={styles.mealDetails}>
                  <span className={styles.mealId}>
                    Meal ID: {highestDemandMeal.mealId}
                  </span>
                </div>
              </div>
            ) : (
              <div className={styles.noDataMessage}>No meal data available</div>
            )}
          </Card>

          <Card
            title={
              <div className={styles.cardTitle}>
                <TrendingDown className={styles.lowDemandIcon} size={18} />
                Lowest Demand Meal
              </div>
            }
            className={styles.card}
            loading={loading}
          >
            {lowestDemandMeal ? (
              <div className={styles.mealItem}>
                <div className={styles.mealHeader}>
                  <span className={styles.mealName}>
                    {lowestDemandMeal.name}
                  </span>
                  <span className={styles.mealStats}>
                    {lowestDemandMeal.count} orders (
                    {lowestDemandMeal.percentage}%)
                  </span>
                </div>
                <Progress
                  percent={lowestDemandMeal.percentage}
                  strokeColor="#ff4d4f"
                  trailColor="#f0f0f0"
                  showInfo={false}
                />
                <div className={styles.mealDetails}>
                  <span className={styles.mealId}>
                    Meal ID: {lowestDemandMeal.mealId}
                  </span>
                </div>
              </div>
            ) : (
              <div className={styles.noDataMessage}>No meal data available</div>
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
                            {summary.pendingOrders} Pending
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
