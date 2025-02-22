import React from "react";
import styles from "./menu.module.css"; 


const TodayMenu = () => {
  return (
    <div className={styles.menuContainer}>
      <h2 className={styles.menuTitle}>Today Menu</h2>
      <div className={styles.menuGrid}>
        {/* Breakfast Section */}
        <div className={styles.menuCard}>
        <div className={styles.menutop}>
          <h3 className={styles.cardHeader}>Breakfast Sets</h3>
        </div>
          <ul>
            <li>Rice & Curry</li>
            <li>String Hoppers</li>
            <li>Noodles</li>
            <li>Hoppers</li>
            

          </ul>
        </div>

        {/* Lunch Section */}
        <div className={styles.menuCard}>
          <h3 className={styles.cardHeader}>Lunch Set</h3>
          <ul>
            <li>Rice & Curry</li>
            <li>String Hoppers</li>
            <li>Noodles</li>
            <li>Hoppers</li>
            <li>Bread with Curry</li>
          </ul>
        </div>

        {/* Dinner Section */}
        <div className={styles.menuCard}>
          <h3 className={styles.cardHeader}>Dinner Set</h3>
          <ul>
            <li>Rice & Curry</li>
            <li>String Hoppers</li>
            <li>Noodles</li>
            <li>Hoppers</li>
            <li>Bread with Curry</li>
            
          </ul>
        </div>

        {/* button Section */}
        
        <div className={styles.buttonGroup}>
          <button className={styles.updateBtn}>Update Menu</button>
          <button className={styles.removeBtn}>Remove Schedule</button>
          <button className={styles.confirmBtn}>Confirm Schedule</button>
        </div>
          
        

    </div>
        
      
    </div>
  );
};

export default TodayMenu;
