import React, { useEffect, useState } from "react";
import styles from "./NavBar.module.css";
import { MenuOutlined, LogoutOutlined } from "@ant-design/icons";
import { UserOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, ConfigProvider, Dropdown, Avatar } from "antd";
import img from "../../../assets/Logo/logo.png";
import { useNavigate } from "react-router-dom";
import Loading from "../../atoms/loading/loading";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
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
      itemSelectedColor: "#ffffff",
      itemSelectedBg: "#d10000",
      itemActiveBg: "#ff4444",
      itemHoverBg: "#ff6666",
      itemMarginInline: 10,
      itemMarginBlock: 14,
      iconMarginInlineEnd: 16,
    },
  },
};

const darkTheme = {
  token: {
    colorText: "#ffffff",
    colorBgBase: "#000000",
  },
  components: {
    Menu: {
      itemHeight: 50,
      itemSelectedColor: "#ffffff",
      itemSelectedBg: "#660000",
      itemActiveBg: "#990000",
      itemHoverBg: "#bb0000",
      itemMarginInline: 10,
      itemMarginBlock: 14,
      iconMarginInlineEnd: 16,
      colorBgContainer: "#000000",
      colorText: "#ffffff",
    },
    Dropdown: {
      colorBgElevated: "#000000",
      colorText: "#ffffff",
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
  const { theme } = useTheme();

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

  // Add Fingerprint tab to menuItems if not present
  // Use menuItems directly for rendering
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
    <div className={`${styles.main} ${theme === "dark" ? "dark" : ""}`}>
      <ConfigProvider theme={theme === "dark" ? darkTheme : customTheme}>
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
            theme={theme === "dark" ? "dark" : "light"}
            mode="inline"
            selectedKeys={[selectedKey]}
            items={renderedMenuItems}
          />
          <div className={styles.orgIdContainer}>
            {collapsed ? (
              <b></b>
            ) : (
              <>
                Organization ID: <b>{authData?.orgId || "N/A"}</b>
              </>
            )}
          </div>
        </Sider>
      </ConfigProvider>

      <div className={styles.homeContent}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 55,
                height: 55,
                color: theme === "dark" ? "#ffffff" : "#000000",
                backgroundColor:
                  theme === "dark" ? "transparent" : "transparent",
              }}
            />
          </div>
          <img className={styles.logo} src={img} alt="Logo" />
          <div className={styles.headerRight}>
            <div className={styles.themeToggleContainer}>
              <ThemeToggle />
            </div>
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
        </div>
        <div className={styles.content}>
          <Comp />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
