import React from 'react';
import { Button, ConfigProvider, Space } from 'antd';
import styles from './Button.module.css';

const GButton = ({ onClick, padding = '2vw', children }) => {
  return (
    
    
        <button
          type="primary"
          size="large"
          onClick={onClick}
          className={styles.linearGradientButton}
          style={{ padding }}
        >
          {children}
        </button>
      
   
  );
};

export default GButton;