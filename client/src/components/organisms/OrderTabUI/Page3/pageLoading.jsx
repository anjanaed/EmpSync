import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

const Loading = ({ text }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999999,
      background: 'rgba(255, 255, 255, 0.7)',
      WebkitBackdropFilter: 'blur(4px)',
      backdropFilter: 'blur(4px)',
    }}
  >
    <Spin
      indicator={
        <LoadingOutlined
          style={{
            fontSize: 75,
            color: '#5D071C',
          }}
          spin
        />
      }
    />
    {text && (
      <div
        style={{
          marginTop: '1vw',
          fontSize: '1vw',
          fontFamily: '"Figtree", sans-serif',
          color: '#5D071C',
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    )}
  </div>
);

export default Loading;