import React, { useEffect, useState } from "react";
import styles from "./NavBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserPlus,
  faFileInvoice,
  faDollarSign,
  faClipboardUser,
} from "@fortawesome/free-solid-svg-icons";
import { MenuOutlined, LogoutOutlined } from "@ant-design/icons";
import { UserOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, ConfigProvider, Dropdown, Avatar } from "antd";
import img from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import Loading from "../../atoms/loading/loading";
const { Sider } = Layout;

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

const NavBar = ({ Comp }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //Profile Dropdown Menu
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
      onClick: () => navigate("/login"),
    },
  ];
  

  //Set Selected Tab (For CSS)
  const checkPath = () => {
    setLoading(true);
    const path = location.pathname;
    if (path == "/") {
      setSelectedKey("1");
    }
    if (path == "/reg") {
      setSelectedKey("2");
    }
    if (path == "/payroll") {
      setSelectedKey("3");
    }
    if (path == "/reportPage") {
      setSelectedKey("4");
    }
    if (path == "/Attendance") {
      setSelectedKey("5");
    }
    setLoading(false);
  };

  useEffect(() => {
    checkPath();
  }, [location.pathname]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.main}>
      <ConfigProvider theme={customTheme}>
        <Sider
          className={styles.sider}
          trigger={null}
          width={"15vw"}
          collapsible
          collapsed={collapsed}
        >
          {!collapsed && (
            <>
              <h1 className={styles.navHeader}>
                <div className={styles.red}>
                  Human <br /> Resource
                </div>
                Management
              </h1>
              <hr className={styles.line} />
            </>
          )}
          {collapsed && (
            <>
              <h1 className={styles.navHeader}>
                <div className={styles.red}>
                  H <br /> R
                </div>
                M
              </h1>
              <hr className={styles.line} />
            </>
          )}
          {/* Menu Items */}
          <Menu
            className={styles.menu}
            theme="light"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={[
              {
                key: "1",
                icon: <FontAwesomeIcon icon={faUsers} />,
                label: "Employees",
                onClick: () => navigate("/"),
              },
              {
                key: "2",
                icon: <FontAwesomeIcon icon={faUserPlus} />,
                label: "Registration",
                onClick: () => navigate("/reg"),
              },
              {
                key: "3",
                icon: <FontAwesomeIcon icon={faDollarSign} />,
                label: "Payrolls",
                onClick: () => navigate("/payroll"),
              },
              {
                key: "4",
                icon: <FontAwesomeIcon icon={faFileInvoice} />,
                label: "Reports",
                onClick: () => navigate("/reportPage"),
              },
              {
                key: "5",
                icon: <FontAwesomeIcon icon={faClipboardUser} />,
                label: "Attendance",
                onClick: () => navigate("/Attendance"),
              },
            ]}
          />
        </Sider>
      </ConfigProvider>
      <div className={styles.homeContent}>
        <div className={styles.headerContent}>
          {/* Collapsing Button */}
          <Button
            type="text"
            icon={collapsed ? <MenuOutlined /> : <MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <img className={styles.logo} src={img}></img>
          <div className={styles.userDropdown}>
            {/* User Dropdown */}
            <Dropdown
              menu={{ items: dropdownItems }}
              placement="bottomRight"
              trigger={["click"]}
              overlayClassName={styles.userDropdownMenu}
            >
              <div className={styles.userInfo}>
                <Avatar
                  style={{ backgroundColor: "#d10000" }}
                  size={36}
                  icon={<UserOutlined />}
                />
                <div className={styles.userDetails}>
                  <div className={styles.userName}>Anjana Edirisinghe</div>
                  <div className={styles.userPosition}>HR Manager</div>
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
