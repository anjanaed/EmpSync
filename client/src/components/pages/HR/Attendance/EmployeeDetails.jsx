import React from "react";
import Employee from "../../../organisms/Attendance/Employee Details/EmployeeDetails"; // Corrected import path
import NavBar from "../../../organisms/NavBar/NavBar";

const EmployeeDetails = () => {
  return (
    <>
      <NavBar Comp={Employee} />
    </>
  );
};

export default EmployeeDetails;
