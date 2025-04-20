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

  // Function to check meal types for a specific date
  const checkMealTypes = (date, schedules) => {
    const formattedDate = date.toISOString().split("T")[0];
    
    // Find the schedule for the given date
    const daySchedule = schedules.find((schedule) => {
      const scheduleDate = new Date(schedule.date).toISOString().split("T")[0];
      return scheduleDate === formattedDate;
    });
    
    // If no schedule exists for the date, all meal types are missing
    if (!daySchedule) {
      return { 
        exists: false, 
        missingMeals: ["breakfast", "lunch", "dinner"] 
      };
    }
    
    // Check which meal types are missing or empty
    const missingMeals = [];
    
    if (!daySchedule.breakfast || daySchedule.breakfast.length === 0) {
      missingMeals.push("breakfast");
    }
    
    if (!daySchedule.lunch || daySchedule.lunch.length === 0) {
      missingMeals.push("lunch");
    }
    
    if (!daySchedule.dinner || daySchedule.dinner.length === 0) {
      missingMeals.push("dinner");
    }
    
    return {
      exists: true,
      missingMeals: missingMeals
    };
  };

  // Function to fetch schedules and check for missing dates and meal types
  const checkSchedules = async () => {
    try {
      const response = await axios.get("http://localhost:3000/schedule");
      const schedules = response.data;

      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check next 5 days, starting from tomorrow
      const missingScheduleInfo = [];
      
      for (let i = 1; i <= 5; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        
        const mealCheck = checkMealTypes(checkDate, schedules);
        
        if (!mealCheck.exists || mealCheck.missingMeals.length > 0) {
          missingScheduleInfo.push({
            date: new Date(checkDate),
            displayDate: new Date(checkDate), // Will be modified for display
            missing: mealCheck.missingMeals,
            exists: mealCheck.exists
          });
        }
      }

      // Create notifications for missing schedules or meal types
      if (missingScheduleInfo.length > 0) {
        const options = { weekday: "long", month: "short", day: "numeric" };
        
        // Group notifications by type: missing dates vs. incomplete dates
        const missingDates = missingScheduleInfo.filter(info => !info.exists);
        const incompleteDates = missingScheduleInfo.filter(info => info.exists && info.missing.length > 0);
        
        // Create notification for completely missing dates
        if (missingDates.length > 0) {
          // Adjust display dates to show previous day for UI purposes
          const displayDates = missingDates.map(info => {
            const displayDate = new Date(info.date);
            displayDate.setDate(displayDate.getDate() - 1);
            return displayDate.toLocaleDateString("en-US", options);
          }).join(", ");
            
          const newNotification = {
            id: Date.now(),
            type: "alert",
            title: "Schedule Alert",
            message: `Your menu is not scheduled for ${
              missingDates.length === 1 ? "a day" : `${missingDates.length} days`
            } (${displayDates}). Please schedule all meals.`,
            time: "Just now",
            read: false,
          };
          
          setNotifications(prev => {
            // Check if a similar notification already exists
            const exists = prev.some(
              n => n.type === "alert" && n.title === "Schedule Alert" && n.message === newNotification.message
            );
            if (!exists) {
              return [...prev, newNotification];
            }
            return prev;
          });
        }
        
        // Create notifications for incomplete schedules (missing meal types)
        incompleteDates.forEach(info => {
          // Set display date to previous day for UI purposes
          const displayDate = new Date(info.date);
          displayDate.setDate(displayDate.getDate() - 1);
          const formattedDate = displayDate.toLocaleDateString("en-US", options);
          
          const missingMeals = info.missing.map(meal => meal.charAt(0).toUpperCase() + meal.slice(1)).join(", ");
          
          const newNotification = {
            id: Date.now() + Math.random(), // Ensure unique ID
            type: "alert",
            title: "Incomplete Meal Schedule",
            message: `${missingMeals} not scheduled for ${formattedDate}. Please complete the schedule.`,
            time: "Just now",
            read: false,
          };
          
          setNotifications(prev => {
            // Check if a similar notification already exists
            const exists = prev.some(
              n => n.type === "alert" && n.title === "Incomplete Meal Schedule" && n.message === newNotification.message
            );
            if (!exists) {
              return [...prev, newNotification];
            }
            return prev;
          });
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

      setNotifications((prev) => {
        // Check if a similar notification already exists
        const exists = prev.some(
          (n) => n.type === "alert" && n.title === "Connection Error"
        );
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
    if (notification.title === "Schedule Alert" || notification.title === "Incomplete Meal Schedule") {
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
        <div id="notification-panel" className={styles.notificationSidePanel}>
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
                  className={`${styles.notificationItem} ${
                    !notification.read ? styles.unreadNotification : ""
                  }`}
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
                  {(notification.title === "Schedule Alert" || notification.title === "Incomplete Meal Schedule") && (
                    <CalendarOutlined
                      className={styles.notificationActionIcon}
                    />
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