import React from "react";
import Employees from "../../../components/hrDashboard/EmployeeList/Employees";
import NewNavBar from "../../../components/hrDashboard/NavBar/NavBar";

const EmployeePage = () => {
  return (
    <>
      <NewNavBar Comp={Employees} />
    </>
  );
};

export default EmployeePage;
