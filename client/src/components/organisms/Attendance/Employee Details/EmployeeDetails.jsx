import React from "react";
import styles from "./EmployeeDetails.module.css";
import NavBar from "../AttendanceNavbar/AttendanceNavbar";

const employees = [
  { id: 'EMP001', name: 'John Smith', department: 'Engineering', checkIn: '08:45', checkOut: '17:30', status: 'Present', hours: '8:45' },
  { id: 'EMP002', name: 'Sarah Johnson', department: 'Human Resources', checkIn: '09:05', checkOut: '18:15', status: 'Present', hours: '9:10' },
  { id: 'EMP003', name: 'Michael Brown', department: 'Finance', checkIn: '08:30', checkOut: '17:00', status: 'Present', hours: '8:30' },
  { id: 'EMP004', name: 'Emily Davis', department: 'Marketing', checkIn: '-', checkOut: '-', status: 'Absent', hours: '0:00' },
  { id: 'EMP005', name: 'David Wilson', department: 'Operations', checkIn: '09:45', checkOut: '16:30', status: 'Late', hours: '6:45' },
  { id: 'EMP006', name: 'Jessica Taylor', department: 'Engineering', checkIn: '08:55', checkOut: '17:45', status: 'Present', hours: '8:50' },
  { id: 'EMP007', name: 'Robert Martinez', department: 'Finance', checkIn: '08:30', checkOut: '17:15', status: 'Present', hours: '8:45' },
  { id: 'EMP008', name: 'Jennifer Garcia', department: 'Human Resources', checkIn: '10:15', checkOut: '18:00', status: 'Late', hours: '7:45' },
];

const EmployeeTable = () => {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Status</th>
            <th>Work Hours</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td className={styles.empId}>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.department}</td>
              <td>{emp.checkIn}</td>
              <td>{emp.checkOut}</td>
              <td>
                <span className={`${styles.status} ${styles[emp.status.toLowerCase()]}`}>
                  {emp.status}
                </span>
              </td>
              <td>{emp.hours}</td>
              <td><button className={styles.viewBtn}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AttendanceDashboard = () => {
  return (
    <div className={styles.dash}>
      <div className={styles.mainBox}>
        <NavBar />
        <div className={styles.mainTitle}>
          <h1>Employee Attendance Details</h1>
          <span>Select an employee to view their detailed attendance records</span>
        </div>
        <EmployeeTable />
      </div>
    </div>
  );
};

export default AttendanceDashboard;


