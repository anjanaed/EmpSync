import React from 'react';
import { Button, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip 
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      placement="bottom"
    >
      <Button
        type="text"
        icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
        onClick={toggleTheme}
        className={styles.themeToggle}
      />
    </Tooltip>
  );
};

export default ThemeToggle;