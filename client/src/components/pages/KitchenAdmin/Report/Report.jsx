import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faChartLine,
  faBowlFood,
} from "@fortawesome/free-solid-svg-icons";
import { BellOutlined } from "@ant-design/icons";

import NavBar from "../../../organisms/NavBar/NavBar";
import Section from "../../../organisms/Kitchen/ReportSection/reportSection";
import NotificationPanel from "../../../organisms/Kitchen/NotificationPanel/NotificationPanel";
import { useNotifications } from "../../../../contexts/NotificationsContext";
import styles from "../../../organisms/Kitchen/NotificationPanel/NotificationPanel.module.css";

const Report = () => {
  const { getUnreadCount, toggleNotifications } = useNotifications();

  // Create notification menu item
  const notificationMenuItem = {
    key: "4",
    className: "notification-menu-item",
    icon: <BellOutlined />,
    label: (
      <div className={styles.notificationMenuItem}>
        Notifications
        {getUnreadCount() > 0 && (
          <span className={styles.notificationBadge}>{getUnreadCount()}</span>
        )}
      </div>
    ),
    onClick: toggleNotifications,
  };

  return (
    <>
      <NavBar
        titleLines={["Meal", "Schedule", "Management"]}
        menuItems={[
          {
            key: "1",
            icon: <FontAwesomeIcon icon={faCalendar} />,
            label: "Schedule",
            link: "/kitchen-admin",
          },
          {
            key: "2",
            icon: <FontAwesomeIcon icon={faBowlFood} />,
            label: "Meal",
            link: "/kitchen-meal",
          },
          {
            key: "3",
            icon: <FontAwesomeIcon icon={faChartLine} />,
            label: "Report & Analysis",
            link: "/kitchen-report",
          },

          notificationMenuItem // Add the notification menu item
        ]}
        Comp={Section}
      />
      <NotificationPanel /> {/* Add the notification panel */}
    </>
  );
};

export default Report;
