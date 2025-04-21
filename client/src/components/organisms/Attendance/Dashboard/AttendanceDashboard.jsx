import React from "react";
import styles from "./AttendanceDashboard.module.css";
import NavBar from "../Navbar/Navbar"; // Updated import path
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

// Attendance data for the pie chart
const attendanceData = [
  { name: "Present", value: 75, count: 60, color: "#4CAF50" },
  { name: "Late", value: 20, count: 20, color: "#FF9800" },
  { name: "Absent", value: 5, count: 10, color: "#F44336" },
];

// Weekly attendance data for the bar chart
const weeklyData = [
  { day: "Mon", present: 8, late: 1, absent: 0 },
  { day: "Tue", present: 7, late: 2, absent: 0 },
  { day: "Wed", present: 6, late: 2, absent: 1 },
  { day: "Thu", present: 9, late: 0, absent: 0 },
  { day: "Fri", present: 6, late: 2, absent: 1 },
];

const departmentData = [
  { name: "Engineering", present: 3, late: 1, absent: 0 },
  { name: "HR", present: 1, late: 0, absent: 0 },
  { name: "Finance", present: 2, late: 1, absent: 1 },
];

const AttendanceDashboard = () => {
  return (
    <div className={styles.dash}>
      <div className={styles.mainBox}>
        <NavBar />
        <div className={styles.mainTitle}>
          <h1>Attendance Dashboard</h1>
          <span>Access and manage all your reports in one place</span>
        </div>
        <div className={styles.statsCards}>
          {attendanceData.map((item) => (
            <div
              key={item.name}
              className={`${styles.statCard} ${styles[item.name.toLowerCase()]}`}
            >
              <div className={styles.statValue}>{item.count}</div>
              <div className={styles.statName}>{item.name}</div>
              <div className={styles.statPercent}>
                {item.value}% of total employees
              </div>
            </div>
          ))}
        </div>
        <div className={styles.chartsSection}>
          <div className={styles.chartCard}>
            <h3>Attendance Overview</h3>
            <div className={styles.pieChartContainer}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
