import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserPlus,
  faFileInvoice,
  faHand,
  faDollarSign,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import styles from "./hrNavbar.module.css";
import img from "../../assets/logo.png.png";

function Navbar({ selected }) {
  return (
    <div>
      <div className={styles.navbar_base}>
        <img className={styles.logo} src={img}></img>
        <div className={styles.navbar}>
          <div
            className={
              selected === "E" ? styles.navbarItemsSelected : styles.navbarItems
            }
          >
            <FontAwesomeIcon icon={faUsers} /> Employees
          </div>
          <div
            className={
              selected === "R" ? styles.navbarItemsSelected : styles.navbarItems
            }
          >
            {" "}
            <FontAwesomeIcon icon={faUserPlus} /> Registration
          </div>
          <div
            className={
              selected === "P" ? styles.navbarItemsSelected : styles.navbarItems
            }
          >
            {" "}
            <FontAwesomeIcon icon={faDollarSign} /> Payroll
          </div>
          <div
            className={
              selected === "L" ? styles.navbarItemsSelected : styles.navbarItems
            }
          >
            {" "}
            <FontAwesomeIcon icon={faHand} /> Leave Apply
          </div>
          <div
            className={
              selected === "Rep"
                ? styles.navbarItemsSelected
                : styles.navbarItems
            }
          >
            {" "}
            <FontAwesomeIcon icon={faFileInvoice} /> Reports
          </div>
        </div>
        <div className={styles.logout}>
          <FontAwesomeIcon icon={faArrowRightFromBracket} /> Log Out
        </div>
      </div>
    </div>
  );
}

export default Navbar;
