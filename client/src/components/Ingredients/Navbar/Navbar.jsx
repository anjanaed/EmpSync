import React, { useEffect, useState } from "react";
import styles from "./NavBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserPlus,
  faFileInvoice,
  faDollarSign,
  faBoxes,
  faChartLine,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import { MenuOutlined, LogoutOutlined } from "@ant-design/icons";
import { UserOutlined } from "@ant-design/icons";
import {
  Button,
  Layout,
  Menu,
  ConfigProvider,
  Space,
  Dropdown,
  Avatar,
} from "antd";
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
          <LogoutOutlined className={styles.menuItemIcon} />&nbsp;Log out
        </div>
      ),
      onClick: () => navigate("/login"),
    },
  ];

  const items = [
    {
      key: "1",
      label: (
        <div className={styles.logout}>
          Logout <t /> <LogoutOutlined />
        </div>
      ),
      onClick: () => navigate("/login"),
    },
  ];
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkPath = () => {
    const path = window.location.pathname;
    switch (path) {
      case "/Ingredients":
        setSelectedKey("1");
        break;
      case "/AnalysisDashboard":
        setSelectedKey("2");
        break;
      case "/OrderReportDashboard":
        setSelectedKey("3");
        break;
      case "/OrderHistory":
        setSelectedKey("4");
        break;
      default:
        setSelectedKey("");
    }
  };

  useEffect(() => {
    checkPath();
  }, [window.location.pathname]);

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
                  Inventory <br />
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
                  Inv <br />
                </div>
                M
              </h1>
              <hr className={styles.line} />
            </>
          )}
          <Menu
            className={styles.menu}
            theme="light"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={[
              {
                key: "1",
                icon: <FontAwesomeIcon icon={faBoxes} />,
                label: "Inventory Management",
                onClick: () => navigate("/Ingredients"),
              },
              {
                key: "2",
                icon: <FontAwesomeIcon icon={faChartLine} />,
                label: "Analysis",
                onClick: () => navigate("/AnalysisDashboard"),
              },
              {
                key: "3",
                icon: <FontAwesomeIcon icon={faFileInvoice} />,
                label: "Ingredient Selection",
                onClick: () => navigate("/OrderReportDashboard"),
              },
              {
                key: "4",
                icon: <FontAwesomeIcon icon={faHistory} />,
                label: "Orders History",
                onClick: () => navigate("/OrderHistory"),
              },
            ]}
          />
        </Sider>
      </ConfigProvider>
      <div className={styles.homeContent}>
        <div className={styles.headerContent}>
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
                  <div className={styles.userName}>Chamilka Mihiraj</div>
                  <div className={styles.userPosition}>Inventory Manager</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </div>
        <div className={styles.content}>
          {Comp ? <Comp /> : <div>No component provided</div>}
        </div>
      </div>
    </div>
  );
};

export default NavBar;