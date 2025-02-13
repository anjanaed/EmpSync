import  React  from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers,faUserPlus,faFileInvoice,faHand, faDollarSign,faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import {Link} from 'react-router-dom'
import styles from './hrNavbar.module.css';


function Navbar(){



    return(
        <div>
        <div className={styles.navbar_base}>
          <div className={styles.navbar}>
          <div className={styles.navbarItems}><FontAwesomeIcon icon={faUsers} /> Employees</div>
          <div className={styles.navbarItems}> <FontAwesomeIcon icon={faUserPlus} /> Registration</div>
          <div className={styles.navbarItems}> <FontAwesomeIcon icon={faDollarSign} /> Payroll</div>
          <div className={styles.navbarItems}> <FontAwesomeIcon icon={faHand} /> Leave Apply</div>
          <div className={styles.navbarItems}> <FontAwesomeIcon icon={faFileInvoice} /> Reports</div>
          </div>
          <div className={styles.logout}>
            <FontAwesomeIcon icon={faArrowRightFromBracket}/> Log Out
          </div>
        </div>
    </div>
    )

    
}

export default Navbar;