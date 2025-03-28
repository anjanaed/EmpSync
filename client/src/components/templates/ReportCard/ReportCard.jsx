import React from "react";
import styles from "./ReortCard.module.css";

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
            <button onClick={btnView}  className={styles.btn1}>View</button>
            <button onClick={btnDownload} className={styles.btn2}>Download</button>
          </div>
        </div>
      </div>
  );
};

export default ReportCard;
