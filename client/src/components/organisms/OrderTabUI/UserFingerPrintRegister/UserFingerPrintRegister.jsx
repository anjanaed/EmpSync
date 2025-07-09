import React from "react";
import styles from "./UserFingerPrintRegister.module.css";
// import bgImage from "../../../../assets/Login/loginbackground.png";
import otbImage from "../../../../assets/Order/otb1.jpg";

const UserFingerPrintRegister = () => (
<div
    className={styles.full}
    style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${otbImage})`,
    }}
>
        <div>
            <h1 className={styles.mainTitle1}>
                Welcome to <span>Helix</span> Food Ordering
            </h1>
            <h2 className={styles.subHeading}>
                New User Register on FingerPrint Device
            </h2>
        </div>
        <div className={styles.content}>
            {/* Content background only, no inner content */}
        </div>
    </div>
);

export default UserFingerPrintRegister;