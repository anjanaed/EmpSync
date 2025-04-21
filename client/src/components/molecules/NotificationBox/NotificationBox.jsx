import React, { useEffect } from 'react';
import { notification } from 'antd';

const NotificationBox = ({
  type = 'info',
  title = 'Notification',
  children,
  duration = 4.5,
  placement = 'topRight',
  pauseOnHover = true,
}) => {
  useEffect(() => {
    notification[type]({
      message: title,
      description: children,
      placement,
      duration,
      pauseOnHover,
    });
  }, []);

  return null; 
};

export default NotificationBox;
