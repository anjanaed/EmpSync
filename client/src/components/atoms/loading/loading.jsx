import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import styles from './loading.module.css';

const Loading = ({ text }) => (
  <div className={styles.loadingWrapper}>
    <Spin
      indicator={
        <LoadingOutlined
          style={{
            fontSize: 75,
            color: "#5D071C",
          }}
          spin
        />
      }
    />
    {text && <div className={styles.loadingText}>{text}</div>}
  </div>
);

export default Loading;