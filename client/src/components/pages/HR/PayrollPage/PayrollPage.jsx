import React from 'react'
import {
  faUsers,
  faUserPlus,
  faFileInvoice,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Payroll from '../../../organisms/Payroll/Payroll';
import NavBar from '../../../organisms/NavBar/NavBar';


const PayrollPage = () => {
  return (
    <NavBar
    titleLines={["Human", "Resource", "Management"]}
    menuItems={[
      {
        key: "1",
        icon: <FontAwesomeIcon icon={faUsers} />,
        label: "Employees",
        link: "/"
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
    Comp={Payroll}
  />
    
    
  )
}

export default PayrollPage




