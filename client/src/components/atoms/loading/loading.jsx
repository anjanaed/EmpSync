import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';
import styles from './loading.module.css'


const Loading = () => (
  <div className={styles.loadingWrapper}>
    <Spin
      indicator={
        <LoadingOutlined
          style={{
            fontSize: 75,
            color:"#5D071C",
          }}
          spin
        />
      }
    />
  </div>
);
export default Loading;