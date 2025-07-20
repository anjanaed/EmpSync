import React, { createContext, useContext } from 'react';
import { message, ConfigProvider } from 'antd';
import { useTheme } from './ThemeContext.jsx';

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { theme } = useTheme();

  const messageTheme = {
    components: {
      Message: {
        contentBg: theme === 'dark' ? '#303030' : '#ffffff',
        colorText: theme === 'dark' ? '#ffffff' : '#000000',
        colorSuccess: theme === 'dark' ? '#52c41a' : '#52c41a',
        colorError: theme === 'dark' ? '#ff4d4f' : '#ff4d4f',
        colorWarning: theme === 'dark' ? '#faad14' : '#faad14',
        colorInfo: theme === 'dark' ? '#1890ff' : '#1890ff',
        borderRadius: 8,
        fontSize: 14,
        boxShadow: theme === 'dark' 
          ? '0 6px 16px 0 rgba(0, 0, 0, 0.5), 0 3px 6px -4px rgba(0, 0, 0, 0.3), 0 9px 28px 8px rgba(0, 0, 0, 0.2)'
          : '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
      },
    },
  };

  const success = (msg, delay = 300, duration = 2.5) => {
    setTimeout(() => {
      messageApi.open({
        type: 'success',
        content: msg,
        duration,
      });
    }, delay);
  };

  const error = (msg, delay = 300, duration = 3) => {
    setTimeout(() => {
      messageApi.open({
        type: 'error',
        content: msg,
        duration,
      });
    }, delay);
  };

  return (
    <ConfigProvider theme={messageTheme}>
      <PopupContext.Provider value={{ success, error }}>
        {contextHolder}
        {children}
      </PopupContext.Provider>
    </ConfigProvider>
  );
};

export const usePopup = () => useContext(PopupContext);
