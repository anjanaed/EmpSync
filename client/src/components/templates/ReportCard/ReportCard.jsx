import React from "react";
import styles from "./ReortCard.module.css";
import { HiEye  } from "react-icons/hi2";
import { HiDownload } from "react-icons/hi";


const ReportCard = ({cardTitle, cardDes, lastUpdate,btnView,btnDownload,} ) => {
  return (

      <div>
        <div className={styles.card}>
          <div className={styles.left}>
            <div className={styles.cardTitle}>
              {cardTitle}
              <br /> <span>{cardDes}</span>
            </div>
            <div className={styles.lastUpdate}>
              <span>*</span> Last Update : {lastUpdate}
            </div>
          </div>
          <div className={styles.right}>
            <button onClick={btnView}  className={styles.btn1}><HiEye  size={18}/>&nbsp;View</button>
            <button onClick={btnDownload} className={styles.btn2}><HiDownload size={18}/>&nbsp;Download</button>
          </div>
        </div>
      </div>
  );
};

export default ReportCard;
