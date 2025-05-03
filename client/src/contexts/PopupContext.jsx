import React, { createContext, useContext } from 'react';
import { message } from 'antd';

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

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
    <PopupContext.Provider value={{ success, error }}>
      {contextHolder}
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => useContext(PopupContext);
