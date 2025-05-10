import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

// Utility function to format time ago
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) return "Just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
};

const NotificationsContext = createContext();

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Helper function to create notifications
  const createNotification = (
    type,
    title,
    message,
    actionType = null,
    scheduleDate = null
  ) => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    displayTime: "Just now",
    read: false,
    actionType,
    scheduleDate,
  });

  // Add unique notification
  const addUniqueNotification = (newNotification) => {
    setNotifications((prev) => {
      const exists = prev.some(
        (n) =>
          n.type === newNotification.type &&
          n.title === newNotification.title &&
          n.message === newNotification.message
      );
      return exists ? prev : [...prev, newNotification];
    });
  };

  const checkMealTypes = (date, schedules) => {
    const formattedDate = date.toISOString().split("T")[0];
    const daySchedule = schedules.find(
      (schedule) =>
        new Date(schedule.date).toISOString().split("T")[0] === formattedDate
    );

    if (!daySchedule) {
      return {
        exists: false,
        missingMeals: ["breakfast", "lunch", "dinner"],
        confirmed: false,
      };
    }

    const missingMeals = ["breakfast", "lunch", "dinner"].filter(
      (meal) => !daySchedule[meal]?.length
    );

    return {
      exists: true,
      missingMeals,
      confirmed: daySchedule.confirmed || false,
      scheduleDate: formattedDate,
    };
  };

  // Check schedules
  const checkSchedules = async () => {
    try {
      const response = await axios.get("http://localhost:3000/schedule");
      const schedules = response.data;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const scheduleInfo = Array.from({ length: 6 }, (_, i) => {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i + 1);
        const mealCheck = checkMealTypes(checkDate, schedules);

        return {
          date: new Date(checkDate),
          displayDate: new Date(checkDate),
          missing: mealCheck.missingMeals,
          exists: mealCheck.exists,
          confirmed: mealCheck.confirmed
        };
      });

      // Filter for different notification types
      const missingScheduleInfo = scheduleInfo.filter(info => 
        !info.exists || info.missing.length > 0
      );
      
      const unconfirmedSchedules = scheduleInfo.filter(info => 
        info.exists && !info.confirmed
      );

      if (missingScheduleInfo.length > 0) {
        createScheduleNotifications(missingScheduleInfo);
      }

      if (unconfirmedSchedules.length > 0) {
        createUnconfirmedNotifications(unconfirmedSchedules);
      }
    } catch (error) {
      addUniqueNotification(
        createNotification(
          "alert",
          "Connection Error",
          "Unable to fetch schedule data. Please check your connection."
        )
      );
    }
  };

  const createScheduleNotifications = (missingScheduleInfo) => {
    const options = { weekday: "long", month: "short", day: "numeric" };
    const missingDates = missingScheduleInfo.filter((info) => !info.exists);
    const incompleteDates = missingScheduleInfo.filter(
      (info) => info.exists && info.missing.length > 0
    );

    // Handle missing dates
    if (missingDates.length > 0) {
      const displayDates = missingDates
        .map((info) => {
          const displayDate = new Date(info.date);
          displayDate.setDate(displayDate.getDate() - 1);
          return displayDate.toLocaleDateString("en-US", options);
        })
        .join(", ");
      addUniqueNotification(
        createNotification(
          "alert",
          "Schedule Alert",
          `Your menu is not scheduled for ${
            missingDates.length === 1 ? "a day" : `${missingDates.length} days`
          } (${displayDates}). Please schedule all meals.`
        )
      );
    }
    
    // Handle incomplete dates
    incompleteDates.forEach((info) => {
      const displayDate = new Date(info.date);
      displayDate.setDate(displayDate.getDate() - 1);
      const formattedDate = displayDate.toLocaleDateString("en-US", options);
      const missingMeals = info.missing
        .map((meal) => meal.charAt(0).toUpperCase() + meal.slice(1))
        .join(", ");

      addUniqueNotification(
        createNotification(
          "alert",
          "Incomplete Meal Schedule",
          `${missingMeals} not scheduled for ${formattedDate}. Please complete the schedule.`
        )
      );
    });
  };

  // Separate function to handle unconfirmed schedules
  const createUnconfirmedNotifications = (unconfirmedDates) => {
    const options = { weekday: "long", month: "short", day: "numeric" };
    
    if (unconfirmedDates.length > 0) {
      const displayDates = unconfirmedDates
        .map((info) => {
          const displayDate = new Date(info.date);
          displayDate.setDate(displayDate.getDate() - 1);
          return displayDate.toLocaleDateString("en-US", options);
        })
        .join(", ");

      addUniqueNotification(
        createNotification(
          "warning",
          "Unconfirmed Schedule",
          `Schedule for ${
            unconfirmedDates.length === 1
              ? "this date needs"
              : "these dates need"
          } confirmation: ${displayDates}.`,
          "confirm_schedule"
        )
      );
    }
  };

  // Notification actions
  const toggleNotifications = () => setShowNotifications((prev) => !prev);
  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markAsRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  const getUnreadCount = () => notifications.filter((n) => !n.read).length;
  const handleNotificationAction = (notification, navigate) => {
    markAsRead(notification.id);
    if (
      notification.title.includes("Schedule") ||
      notification.actionType === "confirm_schedule"
    ) {
      navigate("/kitchen-admin");
    }
  };

  // Effects
  useEffect(() => {
    checkSchedules();
    const scheduleInterval = setInterval(checkSchedules, 3600000);
    return () => clearInterval(scheduleInterval);
  }, []);

  useEffect(() => {
    const updateTimes = () => {
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          displayTime: formatTimeAgo(notification.timestamp),
        }))
      );
    };

    updateTimes();
    const timer = setInterval(updateTimes, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const panel = document.getElementById("notification-panel");
      if (
        showNotifications &&
        panel &&
        !panel.contains(event.target) &&
        !event.target.closest(".notification-menu-item")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        showNotifications,
        toggleNotifications,
        markAllAsRead,
        markAsRead,
        getUnreadCount,
        handleNotificationAction,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};