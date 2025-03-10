import React from "react";
import Employees from "../../../components/hrDashboard/EmployeeList/Employees";
import NavBar from "../../../components/hrDashboard/NavBar/NavBar";

const EmployeePage = () => {
  return (
    <>
      <NavBar Comp={Employees} />
    </>
  );
};

export default EmployeePage;
