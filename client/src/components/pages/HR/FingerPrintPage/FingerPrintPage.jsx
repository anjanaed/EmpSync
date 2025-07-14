import React from 'react'
import {
  faUsers,
  faUserPlus,
  faFileInvoice,
  faDollarSign,
  faFingerprint // <-- add this
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FingerPrints from '../../../organisms/HR/FingerPrints/FingerPrints';
import NavBar from '../../../organisms/NavBar/NavBar';


const FingerPrintPage = () => {
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
        key: "5",
        icon: <FontAwesomeIcon icon={faFingerprint} />,
        label: "FingerPrints",
        link: "/FingerPrints"
      }
    ]}
    Comp={FingerPrints}
  />
    
    
  )
}

export default FingerPrintPage
