import React from 'react'
import {
  faUsers,
  faUserPlus,
  faFileInvoice,
  faDollarSign,
  faFingerprint // <-- add this
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NavBar from '../../../organisms/NavBar/NavBar';
import ReportDashboard from '../../../organisms/HR/ReportDashboard/ReportDashboard';


const ReportPage = () => {
  return (
    <NavBar
    titleLines={["Human", "Resource", "Management"]}
    menuItems={[
      {
        key: "1",
        icon: <FontAwesomeIcon icon={faUsers} />,
        label: "Employees",
        link: "/EmployeePage"
      },
      {
        key: "2",
        icon: <FontAwesomeIcon icon={faUserPlus} />,
        label: "Registration",
        link: "/reg"
      },
      {
        key: "3",
        icon: <FontAwesomeIcon icon={faDollarSign} />,
        label: "Payrolls",
        link: "/payroll"
      },
      {
        key: "4",
        icon: <FontAwesomeIcon icon={faFileInvoice} />,
        label: "Reports",
        link: "/reportPage"
      },
      {
        key: "5",
        icon: <FontAwesomeIcon icon={faFingerprint} />,
        label: "FingerPrints",
        link: "/FingerPrints"
      }
    ]}
    Comp={ReportDashboard}
  />
    
    
  )
}

export default ReportPage




