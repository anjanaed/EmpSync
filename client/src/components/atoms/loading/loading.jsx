import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import styles from './loading.module.css';

const Loading = ({ text, type }) => (
  <div
    className={styles.loadingWrapper}
    style={
      type === "dark"
        ? { background: "rgba(0,0,0,0.7)"}
        :{ background: "rgba(255,255,255,0.7)"} 
    }
  >
    <Spin
      indicator={
        <LoadingOutlined
          style={{
            fontSize: 75,
            color: type === "dark" ? "#fff" : "#5D071C",
          }}
          spin
        />
      }
    />
    {text && (
      <div
        className={styles.loadingText}
        style={type === "dark" ? { color: "#fff" } : undefined}
      >
        {text}
      </div>
    )}
  </div>
);

export default Loading;