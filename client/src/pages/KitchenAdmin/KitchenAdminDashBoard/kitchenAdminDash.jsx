import React from "react";
import Navbar from "../../../components/KitchenAdmin/KitchenNavbar/navbar";
import TodayMenu from "../../../components/KitchenAdmin/Menu/menu"; 
import Calender from "../../../components/KitchenAdmin/Calender/calender";
import styles from "./KitchenAdminDash.module.css";

const KitchenAdminDash = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.mainContent}>
      <TodayMenu /> 
      </main>
      
      <Calender/>
     
    </div>
  );
};

export default KitchenAdminDash;
