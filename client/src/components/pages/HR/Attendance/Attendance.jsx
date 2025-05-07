import React from "react";
// import AttendanceDashboard from "../../../organisms/Attendance/Dashboard/AttendanceDashboard"; // Renamed import
import NavBar from "../../../organisms/NavBar/NavBar";
const Attendance = () => {
  return (
    <>
      <NavBar Comp={AttendanceDashboard} /> {/* Use the renamed component */}
    </>
  );
};

export default Attendance;
