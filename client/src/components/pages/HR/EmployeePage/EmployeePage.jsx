import React from "react";
import Employees from "../../../organisms/EmployeeList/Employees";
import NavBar from "../../../organisms/NavBar/NavBar";

const EmployeePage = () => {
  return (
    <>
      <NavBar Comp={Employees} />
    </>
  );
};

export default EmployeePage;
