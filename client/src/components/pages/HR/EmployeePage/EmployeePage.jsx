import React from 'react'
import {
  faUsers,
  faUserPlus,
  faFileInvoice,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Employees from "../../../organisms/HR/EmployeeList/Employees";
import NavBar from '../../../organisms/NavBar/NavBar';


const EmployeePage = () => {
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
      }
    ]}
    Comp={Employees}
  />
    
    
  )
}

export default EmployeePage




