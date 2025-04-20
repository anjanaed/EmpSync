import React from "react";
import { Button } from "antd";
import styles from "./Button.module.css";

const Gbutton = ({ onClick, children,width }) => {
  return (
    <Button
      onClick={onClick}
      type="primary"
      size="large"
      style={{width:width}}
      className={styles.linearGradientButton}
    >
      {children}
    </Button>
  );
};

export default Gbutton;
