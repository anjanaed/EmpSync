// Header.js
import React from 'react';
import { Button , Layout} from 'antd';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate(); 

  const handleDashboardClick = () => {
    navigate('/kitchen-admin');
  };

  const handleLogout = () => {
    ocalStorage.removeItem('token'); 
    localStorage.removeItem('user'); 
    navigate('/login');
  };

  return (
    <Layout.Header style={{ 
      backgroundColor: '#800020', 
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white'
    }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        style={{ color: 'white', padding: 0 }}
        onClick={handleDashboardClick}
      >
        Dash Board
      </Button>
      <Button
        type="text"
        icon={<LogoutOutlined />} 
        style={{ color: 'white', padding: 0 }}
        onClick={handleLogout}
      >
        LOG OUT
      </Button>
    </Layout.Header>
  );

};


export default Header;