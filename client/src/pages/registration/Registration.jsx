import React from "react";
import styles from "./Registration.module.css";
import Navbar from "../../components/hrDashboard/hrNavbar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fa1,fa2 } from '@fortawesome/free-solid-svg-icons';

function Register() {
  return (
    <div className={styles.home}>
      <div className={styles.homeNavbar}>
        <Navbar />
      </div>
      <div className={styles.homeContent}>
        <div className={styles.rBox}>
            <div className={styles.rTable}>
            <div className={styles.rTableContentSelected}>1 User Profile</div>
            <div className={styles.rTableContent}>2 Bio Data</div>
            </div>


        <div className={styles.mid}>
          <h1>Register New Employees</h1>
          <span>
            Enter User Information & Provide Fingerprint At The Next Page To Add New
            Employee To The System
          </span>
        </div>
        <div className={styles.inputs}>
            <div className={styles.inputsBox}>
            <label>Employee Id</label><br></br>  
            <input type="textbox"></input>
            </div>
            <div className={styles.inputsBox}>
            <label>Full Name</label><br></br>  
            <input type="textbox"></input>
            </div>

        </div>

        </div>
        
      </div>
    </div>
  );
}

export default Register;
