// src/components/NotificationPanel/NotificationPanel.js
import React from "react";
import { Button } from "antd";
import { CloseOutlined, CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../../contexts/NotificationsContext";
import styles from "./NotificationPanel.module.css";

const NotificationPanel = () => {
  const {
    notifications,
    showNotifications,
    toggleNotifications,
    markAllAsRead,
    handleNotificationAction,
    confirmSchedule,
  } = useNotifications();
  
  const navigate = useNavigate();

  if (!showNotifications) return null;

  return (
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
              onClick={() => handleNotificationAction(notification, navigate)}
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
              {notification.actionType === "confirm" ? (
                <div className={styles.confirmButtonContainer}>
                  <Button
                    type="primary"
                    size="small"
                    className={styles.confirmButton}
                    icon={<CheckCircleOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmSchedule(notification.scheduleDate);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              ) : (
                (notification.title === "Schedule Alert" ||
                  notification.title === "Incomplete Meal Schedule") && (
                  <CalendarOutlined
                    className={styles.notificationActionIcon}
                  />
                )
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
  );
};

export default NotificationPanel;