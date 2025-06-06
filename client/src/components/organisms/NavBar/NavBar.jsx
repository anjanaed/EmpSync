import React, { useEffect, useState } from "react";
import styles from "./NavBar.module.css";
import { MenuOutlined, LogoutOutlined } from "@ant-design/icons";
import { UserOutlined, BulbOutlined, MoonOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, ConfigProvider, Dropdown, Avatar } from "antd";
import img from "../../../assets/Logo/logo.png";
import imgWhite from "../../../assets/Logo/LOgowhite.png"; // Add this line
import { useNavigate } from "react-router-dom";
import Loading from "../../atoms/loading/loading";
import { useAuth } from "../../../contexts/AuthContext";
import { useDarkMode } from "../../../contexts/DarkModeContext"; // Import context
const { Sider } = Layout;

const roleDisplayMap = {
  HR_ADMIN: "Human Resource Manager",
  INVENTORY_ADMIN: "Inventory Manager",
  KITCHEN_STAFF: "Kitchen Staff",
  KITCHEN_ADMIN: "Kitchen Administrator",
};

const customTheme = {
  token: {
    colorText: "rgb(80, 80, 80)",
  },
  components: {
    Menu: {
      itemHeight: 50,
      itemSelectedColor: "rgb(224, 0, 0)",
      itemSelectedBg: "rgb(230, 230, 230)",
      itemActiveBg: "rgba(255, 120, 120, 0.53)",
      itemMarginInline: 10,
      itemMarginBlock: 14,
      iconMarginInlineEnd: 16,
    },
  },
};

const NavBar = ({ Comp, titleLines = [], menuItems = [] }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState("null");
  const navigate = useNavigate();
  const { authData, logout, authLoading } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode(); // Use context

  // Ensure hooks are always called
  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth <= 1000);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    const match = menuItems.find((item) => item.link === currentPath);
    if (match) setSelectedKey(match.key);
  }, [location.pathname]);

  useEffect(() => {
    if (authData) {
      setCurrentUser(authData.user);
    }
    setLoading(false);
  }, [authData]);

  // Return early if loading
  if (authLoading || loading) {
    return <Loading />;
  }

  const handleLogOut = () => {
    logout();
    setCurrentUser(null);
    navigate("/login");
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
  };

  const dropdownItems = [
    {
      key: "1",
      label: (
        <div className={styles.profileMenuItem}>
          <UserOutlined className={styles.menuItemIcon} /> &nbsp;Profile
        </div>
      ),
      onClick: () => navigate("/profile"),
    },
    {
      key: "2",
      label: (
        <div className={styles.logoutMenuItem}>
          <LogoutOutlined className={styles.menuItemIcon} />
          &nbsp;Log out
        </div>
      ),
      onClick: () => handleLogOut(),
    },
  ];

  const renderTitle = () => (
    <>
      <h1 className={styles.navHeader}>
        {titleLines.map((line, i) => (
          <div key={i} className={i === 0 ? styles.red : ""}>
            {collapsed
              ? line
                  .split(" ")
                  .map((word, idx) => <div key={idx}>{word.charAt(0)}</div>)
              : line}
          </div>
        ))}
      </h1>
      <hr className={styles.line} />
    </>
  );

  const renderedMenuItems = menuItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    onClick: () => {
      if (item.link) navigate(item.link);
      else if (item.onClick) item.onClick();
    },
  }));

  return (
    <div className={`${styles.main} ${darkMode ? styles.dark : ""}`}>
      <ConfigProvider theme={customTheme}>
        <Sider
          className={styles.sider}
          trigger={null}
          width={"15vw"}
          collapsible
          collapsed={collapsed}
        >
          {renderTitle()}
          <Menu
            className={styles.menu}
            theme="light"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={renderedMenuItems}
          />
        </Sider>
      </ConfigProvider>

      <div className={styles.homeContent}>
        <div className={styles.headerContent}>
          <Button
            type="text"
            icon={
              <MenuOutlined style={{ color: darkMode ? "#fff" : undefined }} />
            }
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 55, height: 55 }}
          />
          <img
            className={styles.logo}
            src={darkMode ? imgWhite : img}
            alt="Logo"
          />
          <Button
            type="text"
            icon={
              darkMode ? (
                <BulbOutlined style={{ color: "#fff" }} />
              ) : (
                <MoonOutlined />
              )
            }
            onClick={handleToggleDarkMode}
            className={styles.darkModeBtn}
            style={{ fontSize: "20px", marginLeft: 12 }}
            aria-label="Toggle dark mode"
          />
          <Dropdown
            menu={{ items: dropdownItems }}
            placement="bottomRight"
            trigger={["click"]}
            overlayClassName={styles.userDropdownMenu}
          >
            <div className={styles.userInfo}>
              <Avatar
                style={{ backgroundColor: "#d10000" }}
                icon={<UserOutlined />}
              />
              <div className={styles.userDetails}>
                <div className={styles.userName}>{currentUser.name}</div>
                <div className={styles.userPosition}>
                  {roleDisplayMap[currentUser.role]}
                </div>
              </div>
            </div>
          </Dropdown>
        </div>
        <div className={styles.content}>
          <Comp />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
