// src/contexts/NotificationsContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) {
    return 'Just now';
  } else if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (minutes === 1) {
    return '1 minute ago';
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours === 1) {
    return '1 hour ago';
  } else if (hours < 24) {
    return `${hours} hours ago`;
  } else if (days === 1) {
    return '1 day ago'; 
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const NotificationsContext = createContext();

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Helper function to create consistent notification objects
  const createNotification = (type, title, message, actionType = null, scheduleDate = null) => {
    const timestamp = new Date().toISOString();
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp,
      displayTime: 'Just now',
      read: false,
      actionType,
      scheduleDate
    };
  };

  // Check meal types for a specific date
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
        missingMeals: ["breakfast", "lunch", "dinner"],
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
      missingMeals: missingMeals,
      confirmed: daySchedule.confirmed,
      scheduleDate: formattedDate, // Store the date in the format needed for the API
    };
  };

  // Function to check for unconfirmed schedules
  const checkUnconfirmedSchedules = async () => {
    try {
      // console.log("Starting unconfirmed schedule check...");
      const response = await axios.get("http://localhost:3000/schedule");
      const schedules = response.data;
      // console.log("All schedules:", schedules);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayString = today.toISOString().split("T")[0];
      // console.log("Today's date:", todayString);

      const unconfirmedSchedules = [];

      for (let i = 2; i <= 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const formattedDate = checkDate.toISOString().split("T")[0];

        // console.log(`Checking date: ${formattedDate} (${i} days from today)`);

        try {
          // console.log(`Fetching schedule for ${formattedDate}...`);
          const scheduleResponse = await axios.get(
            `http://localhost:3000/schedule/${formattedDate}`
          );
          const schedule = scheduleResponse.data;
          // console.log(`Schedule found for ${formattedDate}:`, schedule);

          // console.log(`Schedule for ${formattedDate} exists:`, !!schedule);
          // console.log(`Schedule.confirmed property:`, schedule.confirmed);
          // console.log(`Type of confirmed property:`, typeof schedule.confirmed);
          // console.log(`Schedule confirmed status: ${schedule?.confirmed}`);

          if (schedule && schedule.confirmed !== true) {
            const confirmDeadline = new Date(checkDate);
            confirmDeadline.setDate(confirmDeadline.getDate() - 2);
            const deadlineString = confirmDeadline.toISOString().split("T")[0];

            // console.log(`Today: ${todayString}, Deadline: ${deadlineString}`);

            // Notify before or on deadline, as long as schedule is unconfirmed
            if (todayString <= deadlineString) {
              const urgency = i === 2 ? "warning" : "info";
              // console.log(`Adding ${formattedDate} to unconfirmed list with urgency: ${urgency}`);

              unconfirmedSchedules.push({
                scheduleDate: formattedDate,
                date: new Date(schedule.date),
                daysUntilSchedule: i,
                urgency,
              });
            } else {
              // console.log(`Deadline passed for ${formattedDate}, skipping`);
            }
          } else {
            console
              .log
              // `Schedule for ${formattedDate} is already confirmed or invalid. Confirmed value: ${schedule?.confirmed}`
              ();
          }
        } catch (error) {
          // console.log(`No schedule found for ${formattedDate}`, error);
        }
      }

      // console.log("Unconfirmed schedules that need attention:", unconfirmedSchedules);

      if (unconfirmedSchedules.length > 0) {
        // console.log(`Creating ${unconfirmedSchedules.length} notifications`);
        const options = { weekday: "long", month: "short", day: "numeric" };

        unconfirmedSchedules.forEach((schedule) => {
          const formattedDate = schedule.date.toLocaleDateString(
            "en-US",
            options
          );
          // console.log(`Creating notification for ${formattedDate}`);

          let title = "";
          let message = "";

          if (schedule.urgency === "warning") {
            title = "Schedule Confirmation Due Soon";
            message = `Please confirm your meal schedule for ${formattedDate}. The deadline is approaching.`;
          } else {
            title = "Upcoming Meal Schedule Needs Confirmation";
            message = `Please confirm your meal schedule for ${formattedDate}.`;
          }

          const newNotification = createNotification(
            schedule.urgency === "warning" ? "alert" : "update",
            title,
            message,
            "confirm",
            schedule.scheduleDate
          );

          // console.log("New notification:", newNotification);

          setNotifications((prev) => {
            const exists = prev.some(
              (n) =>
                n.scheduleDate === schedule.scheduleDate &&
                n.actionType === "confirm"
            );
            if (!exists) {
              // console.log("Adding notification to list");
              return [...prev, newNotification];
            }
            // console.log("Similar notification already exists, not adding");
            return prev;
          });
        });
      } else {
        // console.log("No unconfirmed schedules requiring notifications");
      }
    } catch (error) {
      // console.error("Error fetching schedules for confirmation check:", error);
    }
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

      for (let i = 1; i <= 6; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);

        const mealCheck = checkMealTypes(checkDate, schedules);

        if (!mealCheck.exists || mealCheck.missingMeals.length > 0) {
          missingScheduleInfo.push({
            date: new Date(checkDate),
            displayDate: new Date(checkDate), // Will be modified for display
            missing: mealCheck.missingMeals,
            exists: mealCheck.exists,
          });
        }
      }

      // Create notifications for missing schedules or meal types
      if (missingScheduleInfo.length > 0) {
        const options = { weekday: "long", month: "short", day: "numeric" };

        // Group notifications by type: missing dates vs. incomplete dates
        const missingDates = missingScheduleInfo.filter((info) => !info.exists);
        const incompleteDates = missingScheduleInfo.filter(
          (info) => info.exists && info.missing.length > 0
        );

        // Create notification for completely missing dates
        if (missingDates.length > 0) {
          // Adjust display dates to show previous day for UI purposes
          const displayDates = missingDates
            .map((info) => {
              const displayDate = new Date(info.date);
              displayDate.setDate(displayDate.getDate() - 1);
              return displayDate.toLocaleDateString("en-US", options);
            })
            .join(", ");

          const newNotification = createNotification(
            "alert",
            "Schedule Alert",
            `Your menu is not scheduled for ${
              missingDates.length === 1 ? "a day" : `${missingDates.length} days`
            } (${displayDates}). Please schedule all meals.`
          );

          setNotifications((prev) => {
            // Check if a similar notification already exists
            const exists = prev.some(
              (n) =>
                n.type === "alert" &&
                n.title === "Schedule Alert" &&
                n.message === newNotification.message
            );
            if (!exists) {
              return [...prev, newNotification];
            }
            return prev;
          });
        }

        // Create notifications for incomplete schedules (missing meal types)
        incompleteDates.forEach((info) => {
          // Set display date to previous day for UI purposes
          const displayDate = new Date(info.date);
          displayDate.setDate(displayDate.getDate() - 1);
          const formattedDate = displayDate.toLocaleDateString(
            "en-US",
            options
          );

          const missingMeals = info.missing
            .map((meal) => meal.charAt(0).toUpperCase() + meal.slice(1))
            .join(", ");

          const newNotification = createNotification(
            "alert",
            "Incomplete Meal Schedule",
            `${missingMeals} not scheduled for ${formattedDate}. Please complete the schedule.`
          );

          setNotifications((prev) => {
            // Check if a similar notification already exists
            const exists = prev.some(
              (n) =>
                n.type === "alert" &&
                n.title === "Incomplete Meal Schedule" &&
                n.message === newNotification.message
            );
            if (!exists) {
              return [...prev, newNotification];
            }
            return prev;
          });
        });
      }
    } catch (error) {
      // console.error("Error fetching schedules:", error);
      // Create an error notification
      const errorNotification = createNotification(
        "alert",
        "Connection Error",
        "Unable to fetch schedule data. Please check your connection."
      );
      
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

  // Handle notification actions
  const handleNotificationAction = (notification, navigate) => {
    // Mark as read
    markAsRead(notification.id);

    // If it's a schedule alert, navigate to the schedules page
    if (
      notification.title === "Schedule Alert" ||
      notification.title === "Incomplete Meal Schedule"
    ) {
      navigate("/kitchen-admin");
    }
  };

  // Initialize notifications when component mounts
  useEffect(() => {
    // Check schedules when component mounts
    checkSchedules();

    // Check for unconfirmed schedules
    checkUnconfirmedSchedules();

    // Set up interval to check schedules periodically (every hour)
    const scheduleInterval = setInterval(checkSchedules, 3600000);

    // Set up interval to check unconfirmed schedules (every 2 hours)
    const confirmationInterval = setInterval(
      checkUnconfirmedSchedules,
      7200000
    );

    return () => {
      clearInterval(scheduleInterval);
      clearInterval(confirmationInterval);
    };
  }, []);

  // Update notification times periodically
  useEffect(() => {
    // Initial update of all timestamps
    setNotifications(currentNotifications => 
      currentNotifications.map(notification => ({
        ...notification,
        displayTime: formatTimeAgo(notification.timestamp)
      }))
    );
    
    // Set up interval to update times every minute
    const timer = setInterval(() => {
      setNotifications(currentNotifications => 
        currentNotifications.map(notification => ({
          ...notification,
          displayTime: formatTimeAgo(notification.timestamp)
        }))
      );
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Handle clicks outside notification panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      const notificationPanel = document.getElementById("notification-panel");

      if (
        showNotifications &&
        notificationPanel &&
        !notificationPanel.contains(event.target) &&
        !event.target.closest(".notification-menu-item")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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