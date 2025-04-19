import React from "react";
import { Button } from "antd";
import styles from "./Button.module.css";

const Gbutton = ({ onClick, children }) => {
  return (
    <Button
      onClick={onClick}
      type="primary"
      size="large"
      className={styles.linearGradientButton}
    >
      {children}
    </Button>
  );
};

export default Gbutton;
