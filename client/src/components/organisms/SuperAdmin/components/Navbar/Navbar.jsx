import { Layout, Menu, Modal } from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  LockOutlined, 
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined 
} from '@ant-design/icons';
import React, { useEffect , useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useAuth } from "../../../../../contexts/AuthContext";

const { Sider } = Layout;

const Navbar = ({ activeMenu, onMenuChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { superLogout } = useAuth();

  const navigate = useNavigate();

  const menuItems = [
    {
      key: 'organizations',
      icon: <TeamOutlined />,
      label: 'Organizations',
      className: styles.menuItem
    },
    {
      key: 'roles',
      icon: <UserOutlined />,
      label: 'Roles',
      className: styles.menuItem
    },
    {
      key: 'permissions',
      icon: <LockOutlined />,
      label: 'Permissions',
      className: styles.menuItem
    }
  ];

  const logoutItem = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      className: `${styles.menuItem} ${styles.logoutItem}`,
      danger: true
    }
  ];

  const handleMenuClick = (item) => {
    if (item.key === 'logout') {
      handleLogout();
    } else {
      // Use the onMenuChange prop passed from SuperAdmin
      onMenuChange(item.key);
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: "Confirm Logout",
      content: "Are you sure you want to logout?",
      okText: "Yes",
      cancelText: "Cancel",
      onOk: () => {
        superLogout();
        navigate('/SuperAdmin/login');
      }
    });
  };

  return (
    <Sider 
      collapsible 
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={250}
      collapsedWidth={80}
      className={styles.navbar}
      trigger={null}
    >
      <div className={styles.header}>
        <div className={styles.logo}>
          {!collapsed ? (
            <span className={styles.logoText}>EmpSync</span>
          ) : (
            <span className={styles.logoIcon}>ES</span>
          )}
        </div>
        <button 
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeMenu]}
        items={menuItems}
        className={styles.menu}
        onClick={handleMenuClick}
      />
      
      <div className={styles.footer}>
        <Menu
          theme="dark"
          mode="inline"
          items={logoutItem}
          className={styles.logoutMenu}
          onClick={handleMenuClick}
        />
      </div>
    </Sider>
  );
};

export default Navbar;