import React from "react";
import Employee from "../../../organisms/Attendance/Employee Details/Employee Details"; // Renamed import
import NavBar from "../../../organisms/NavBar/NavBar";
const EmployeeDetails = () => {
  return (
    <>
      <NavBar Comp={Employee} /> {/* Use the renamed component */}
    </>
  );
};

export default EmployeeDetails;
