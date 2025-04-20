import React, { useEffect, useState } from "react";
import styles from "./navbar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faChartLine,
  faBowlFood,
} from "@fortawesome/free-solid-svg-icons";
import {
  MenuOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  CloseOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Layout,
  Menu,
  ConfigProvider,
  Dropdown,
  Avatar,
  Badge,
} from "antd";
import img from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import Loading from "../../atoms/loading/loading";
import axios from "axios";

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
          <UserOutlined className={styles.menuItemIcon} /> Profile
        </div>
      ),
      onClick: () => navigate("/profile"),
    },
    {
      key: "2",
      label: (
        <div className={styles.logoutMenuItem}>
          <LogoutOutlined className={styles.menuItemIcon} /> Log out
        </div>
      ),
      onClick: () => navigate("/login"),
    },
  ];
  const [showNotifications, setShowNotifications] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Sample notifications data initialized as empty
  const [notifications, setNotifications] = useState([]);

  // Function to check if a date exists in the schedules
  const isDateScheduled = (date, schedules) => {
    const formattedDate = date.toISOString().split('T')[0];
    return schedules.some(schedule => 
      schedule.date.split('T')[0] === formattedDate
    );
  };

  // Function to fetch schedules and check for missing dates
  const checkSchedules = async () => {
    try {
      const response = await axios.get("http://localhost:3000/schedule");
      const schedules = response.data;
      
      // Get tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      // Check next 5 days
      const missingDates = [];
      for (let i = 0; i < 5; i++) {
        const checkDate = new Date(tomorrow);
        checkDate.setDate(checkDate.getDate() + i);
        
        if (!isDateScheduled(checkDate, schedules)) {
          missingDates.push(new Date(checkDate));
        }
      }
      
      // If there are missing dates, create a notification
      if (missingDates.length > 0) {
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        const formattedDates = missingDates.map(date => 
          date.toLocaleDateString('en-US', options)
        ).join(', ');
        
        const newNotification = {
          id: Date.now(),
          type: "alert",
          title: "Schedule Alert",
          message: `Your menu is not scheduled for the next ${missingDates.length} ${missingDates.length === 1 ? 'day' : 'days'} (${formattedDates}). Please make sure to schedule meals.`,
          time: "Just now",
          read: false,
        };
        
        setNotifications(prev => {
          // Check if a similar notification already exists
          const exists = prev.some(n => n.type === "alert" && n.title === "Schedule Alert");
          if (!exists) {
            return [...prev, newNotification];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      // Create an error notification
      const errorNotification = {
        id: Date.now(),
        type: "alert",
        title: "Connection Error",
        message: "Unable to fetch schedule data. Please check your connection.",
        time: "Just now",
        read: false,
      };
      
      setNotifications(prev => {
        // Check if a similar notification already exists
        const exists = prev.some(n => n.type === "alert" && n.title === "Connection Error");
        if (!exists) {
          return [...prev, errorNotification];
        }
        return prev;
      });
    }
  };

  const checkPath = () => {
    setLoading(true);
    const path = location.pathname;
    if (path == "/kitchen-admin") {
      setSelectedKey("1");
    }
    if (path == "/kitchen-meal") {
      setSelectedKey("2");
    }
    if (path == "/kitchen-report") {
      setSelectedKey("3");
    }
    // if (path == "/notifications") {
    //   setSelectedKey("4");
    // }

    setLoading(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const getUnreadCount = () => {
    return notifications.filter((notification) => !notification.read).length;
  };

  const handleNotificationAction = (notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // If it's a schedule alert, navigate to the schedules page
    if (notification.title === "Schedule Alert") {
      navigate("/kitchen-admin");
    }
  };

  useEffect(() => {
    checkPath();
    
    // Check schedules when component mounts
    checkSchedules();
    
    // Set up interval to check schedules periodically (every hour)
    const interval = setInterval(checkSchedules, 3600000);
    
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Close notifications panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const notificationPanel = document.getElementById("notification-panel");
      
      if (
        showNotifications &&
        notificationPanel &&
        !notificationPanel.contains(event.target) &&
        !event.target.closest(".notification-menu-item") // Ignore clicks on the menu item
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

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
                  Meal
                  <br /> Schedule
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
                  M <br /> S
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
                icon: <FontAwesomeIcon icon={faCalendar} />,
                label: "Schedules",
                onClick: () => navigate("/kitchen-admin"),
              },
              {
                key: "2",
                icon: <FontAwesomeIcon icon={faBowlFood} />,
                label: "Meals",
                onClick: () => navigate("/kitchen-meal"),
              },
              {
                key: "3",
                icon: <FontAwesomeIcon icon={faChartLine} />,
                label: "Reports & Analysis",
                onClick: () => navigate("/kitchen-report"),
              },
              {
                key: "4",
                className: "notification-menu-item",
                icon: <BellOutlined />,
                label: (
                  <div className={styles.notificationMenuItem}>
                    Notifications
                    {getUnreadCount() > 0 && (
                      <span className={styles.notificationBadge}>
                        {getUnreadCount()}
                      </span>
                    )}
                  </div>
                ),
                onClick: toggleNotifications,
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
          <img className={styles.logo} src={img} alt="Logo" />

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
                  <div className={styles.userName}>Kavindya Abeykoon</div>
                  <div className={styles.userPosition}>Kitchen Admin</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </div>
        <div className={styles.content}>
          <Comp />
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <div 
          id="notification-panel"
          className={styles.notificationSidePanel}
        >
          <div className={styles.notificationHeader}>
            <h2>Notifications</h2>
            <div className={styles.notificationActions}>
              <Button type="text" onClick={markAllAsRead}>
                Mark all as read
              </Button>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={toggleNotifications}
                className={styles.closeButton}
              />
            </div>
          </div>
          <div className={styles.notificationList}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`${styles.notificationItem} ${!notification.read ? styles.unreadNotification : ''}`}
                  onClick={() => handleNotificationAction(notification)}
                >
                  <div
                    className={`${styles.notificationDot} ${
                      notification.type === "new"
                        ? styles.dotNew
                        : notification.type === "alert"
                        ? styles.dotAlert
                        : styles.dotUpdate
                    }`}
                  ></div>
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationTitle}>
                      {notification.title}
                    </div>
                    <div className={styles.notificationMessage}>
                      {notification.message}
                    </div>
                    <div className={styles.notificationTime}>
                      {notification.time}
                    </div>
                  </div>
                  {notification.title === "Schedule Alert" && (
                    <CalendarOutlined className={styles.notificationActionIcon} />
                  )}
                </div>
              ))
            ) : (
              <div className={styles.emptyNotifications}>
                No notifications to display
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;