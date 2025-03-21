import React from 'react';
import { AntDesignOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Space } from 'antd';
import { createStyles } from 'antd-style';

const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      > span {
        position: relative;
        padding: 2vw;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #8B0000, #A0522D);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0.8;
      }
    }
  `,
}));

const Gbutton = ({ onClick, children }) => {
  const { styles } = useStyle();
  return (
    <ConfigProvider
      button={{
        className: styles.linearGradientButton,
      }}
    >
      <Space>
        <Button onClick={onClick} type="primary" size="large">
          {children}
        </Button>
      </Space>
    </ConfigProvider>
  );
};

export default Gbutton;
