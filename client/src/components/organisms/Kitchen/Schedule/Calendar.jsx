import React, { useState, useEffect } from "react";
import {
  DatePicker,
  Button,
  Checkbox,
  TimePicker,
  Tabs,
  Input,
  Modal,
  Form,
  List,
  Divider,
  Spin,
  Empty,
  message,
  Card,
  Avatar,
  Tag,
} from "antd";
import {
  PlusOutlined,
  CloseOutlined,
  CalendarOutlined,
  PushpinOutlined,
  DeleteOutlined,
  RightOutlined,
  PushpinFilled,
  SearchOutlined,
  ClearOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./Calendar.module.css";
import Loading from "../../../atoms/loading/loading";
import axios from "axios";
import { useAuth } from "../../../../contexts/AuthContext";

const { TabPane } = Tabs;

const MealPlanner = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const urL = import.meta.env.VITE_BASE_URL;
  const [defaultMeals, setDefaultMeals] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [menuItems, setMenuItems] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [newMealName, setNewMealName] = useState("");
  const [availableMeals, setAvailableMeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [form] = Form.useForm();
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [activeMealType, setActiveMealType] = useState(null);
  const [existingSchedule, setExistingSchedule] = useState(null);
  const [scheduledMeals, setScheduledMeals] = useState({});
  const [previousSchedules, setPreviousSchedules] = useState([]); // New state for previous schedules
  const { authData } = useAuth();
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  const token = authData?.accessToken;

  const fetchDefaultMeals = async (date) => {
    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const response = await axios.get(
        `${urL}/meal-types/by-date/${formattedDate}`,
        {
          params: { orgId: authData?.orgId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data;
      // Normalize time data to ensure valid format
      const normalizedData = data.map((meal) => ({
        ...meal,
        time: [
          meal.time?.[0] && dayjs(meal.time[0], "HH:mm", true).isValid()
            ? meal.time[0]
            : null,
          meal.time?.[1] && dayjs(meal.time[1], "HH:mm", true).isValid()
            ? meal.time[1]
            : null,
        ],
      }));
      setDefaultMeals(normalizedData);
      if (normalizedData.length > 0 && !activeTab) {
        const firstMealId = normalizedData[0].id;
        setActiveTab(firstMealId.toString());
        setActiveMealType(normalizedData[0]);
      }
    } catch (error) {
      console.error("Error fetching default meals:", error);
      message.error("Failed to load meal types");
    }
  };

  const fetchAvailableMeals = async () => {
    try {
      const response = await axios.get(`${urL}/meal`, {
        params: { orgId: authData?.orgId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableMeals(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching meals:", error);
      message.error("Failed to load available meals");
      setAvailableMeals([]);
    }
  };

  const fetchAllSchedules = async (date = currentDate) => {
    if (!date) return;
    setScheduledMeals({});
    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const response = await axios.get(`${urL}/schedule/${formattedDate}`, {
        params: { orgId: authData?.orgId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && Array.isArray(response.data)) {
        const schedulesMap = {};
        response.data.forEach((schedule) => {
          const scheduleDate = dayjs(schedule.date).format("YYYY-MM-DD");
          if (scheduleDate === formattedDate) {
            schedulesMap[schedule.mealTypeId] = {
              id: schedule.id,
              mealTypeId: schedule.mealTypeId,
              meals: schedule.meals || [],
              date: schedule.date,
              mealType: schedule.mealType || null,
            };
          }
        });
        setScheduledMeals(schedulesMap);
      } else {
        setScheduledMeals({});
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      if (error.response?.status !== 404) {
        message.error("Failed to load meal schedules");
      }
      setScheduledMeals({});
    }
  };

  // New function to fetch previous schedules for the same meal type
  const fetchPreviousSchedules = async () => {
    if (!activeTab || !currentDate) return;

    try {
      const mealTypeId = parseInt(activeTab);
      const currentDateStr = currentDate.format("YYYY-MM-DD");

      // Fetch schedules from the last 30 days
      const endDate = currentDate.subtract(1, "day");
      const startDate = currentDate.subtract(30, "days");

      const promises = [];
      let tempDate = endDate;

      // Check previous 30 days for schedules with the same meal type
      while (tempDate.isAfter(startDate) || tempDate.isSame(startDate)) {
        const dateStr = tempDate.format("YYYY-MM-DD");
        promises.push(
          axios
            .get(`${urL}/schedule/${dateStr}`, {
              params: { orgId: authData?.orgId },
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => ({
              date: dateStr,
              schedules: response.data || [],
            }))
            .catch(() => ({ date: dateStr, schedules: [] }))
        );
        tempDate = tempDate.subtract(1, "day");
      }

      const results = await Promise.all(promises);
      const previousSchedulesForMealType = [];

      results.forEach(({ date, schedules }) => {
        const matchingSchedule = schedules.find(
          (s) => s.mealTypeId === mealTypeId && s.meals && s.meals.length > 0
        );

        if (matchingSchedule) {
          previousSchedulesForMealType.push({
            date,
            schedule: matchingSchedule,
            mealTypeName:
              matchingSchedule.mealType?.name || activeMealType?.name,
          });
        }
      });

      // Sort by date (most recent first)
      previousSchedulesForMealType.sort(
        (a, b) => dayjs(b.date).unix() - dayjs(a.date).unix()
      );

      setPreviousSchedules(previousSchedulesForMealType);
    } catch (error) {
      console.error("Error fetching previous schedules:", error);
      setPreviousSchedules([]);
    }
  };

  const fetchExistingSchedule = async () => {
    if (!activeTab || !currentDate) return;
    try {
      const formattedDate = currentDate.format("YYYY-MM-DD");
      const response = await axios.get(`${urL}/schedule/${formattedDate}`, {
        params: { orgId: authData?.orgId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && Array.isArray(response.data)) {
        const schedule = response.data.find(
          (s) =>
            s.mealTypeId === parseInt(activeTab) &&
            dayjs(s.date).format("YYYY-MM-DD") === formattedDate
        );
        if (schedule) {
          setExistingSchedule(schedule);
          if (schedule.meals && Array.isArray(schedule.meals)) {
            const mealIds = schedule.meals.map((meal) => meal.id);
            setSelectedMeals(mealIds);
          }
        } else {
          setExistingSchedule(null);
          setSelectedMeals([]);
        }
      } else {
        setExistingSchedule(null);
        setSelectedMeals([]);
      }
    } catch (error) {
      console.error("Error fetching existing schedule:", error);
      if (error.response?.status !== 404) {
        message.error("Failed to load existing schedule");
      }
      setExistingSchedule(null);
      setSelectedMeals([]);
    }
  };

  const handleDateChange = (date) => {
    setCurrentDate(date);
    setActiveTab("");
    setActiveMealType(null);
    setScheduledMeals({});
    setSelectedMeals([]);
    setExistingSchedule(null);
    setPreviousSchedules([]); // Clear previous schedules when date changes
  };

  const modalStyles = {
    mask: {
      backdropFilter: "blur(12px)",
    },
  };

  const handleMealSelection = (mealId) => {
    if (selectedMeals.includes(mealId)) {
      setSelectedMeals(selectedMeals.filter((id) => id !== mealId));
    } else {
      setSelectedMeals([...selectedMeals, mealId]);
    }
  };

  // // New function to copy meals from previous schedule
  // const handleCopyFromPrevious = (previousSchedule) => {
  //   if (previousSchedule.schedule && previousSchedule.schedule.meals) {
  //     const mealIds = previousSchedule.schedule.meals.map((meal) => meal.id);
  //     setSelectedMeals(mealIds);
  //     message.success(
  //       `Copied ${mealIds.length} meals from ${dayjs(
  //         previousSchedule.date
  //       ).format("MMM DD, YYYY")}`
  //     );
  //   }
  // };

  const handleCopyFromPrevious = async (previousSchedule) => {
    if (previousSchedule.schedule && previousSchedule.schedule.meals) {
      const mealIds = previousSchedule.schedule.meals.map((meal) => meal.id);
      setSelectedMeals(mealIds);

      // Optional: Immediately update the schedule on the server
      if (activeTab && currentDate && authData?.orgId && token) {
        const payload = {
          date: currentDate.format("YYYY-MM-DD"),
          mealTypeId: parseInt(activeTab),
          orgId: authData.orgId,
          mealIds,
        };
        try {
          if (existingSchedule) {
            await axios.patch(
              `${urL}/schedule/${existingSchedule.id}`,
              payload,
              {
                params: { orgId: authData.orgId },
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          } else {
            await axios.post(`${urL}/schedule`, payload, {
              params: { orgId: authData.orgId },
              headers: { Authorization: `Bearer ${token}` },
            });
          }
          message.success(
            `Copied ${mealIds.length} meals from ${dayjs(
              previousSchedule.date
            ).format("MMM DD, YYYY")} and updated the schedule`
          );
          await fetchAllSchedules(currentDate);
        } catch (error) {
          message.error("Failed to update schedule with copied meals");
        }
      } else {
        message.success(
          `Copied ${mealIds.length} meals from ${dayjs(
            previousSchedule.date
          ).format("MMM DD, YYYY")}`
        );
      }
    }
  };

  const handlePinMeal = async (id) => {
    try {
      await axios.patch(`${urL}/meal-types/${id}/toggle-default`, {
        params: { orgId: authData?.orgId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDefaultMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal.id === id ? { ...meal, isDefault: !meal.isDefault } : meal
        )
      );
    } catch (err) {
      console.error("Error toggling meal pin:", err);
    }
  };

  const handleDeleteMeal = async (meal) => {
    try {
      if (!meal.isDefault) {
        await axios.delete(`${urL}/meal-types/${meal.id}`, {
          params: { orgId: authData?.orgId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setDefaultMeals((prevMeals) => prevMeals.filter((m) => m.id !== meal.id));
    } catch (err) {
      console.error("Error deleting meal:", err);
    }
  };

  const handleStartTimeChange = async (time, mealId) => {
    try {
      // Update local state to reflect the change
      const formattedTime = time ? time.format("HH:mm") : null;
      setDefaultMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal.id === mealId
            ? { ...meal, time: [formattedTime, meal.time?.[1] || null] }
            : meal
        )
      );

      await axios.patch(
        `${urL}/meal-types/timeupdate/${mealId}/0`,
        {
          newTime: formattedTime,
        },
        {
          params: { orgId: authData?.orgId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchDefaultMeals(currentDate);
      message.success("Time Updated successfully");
    } catch (err) {
      console.error("Error changing start time:", err);
      message.error(
        err.response?.data?.message || "Failed to update start time"
      );
      await fetchDefaultMeals(currentDate); // Revert on error
    }
  };

  const handleEndTimeChange = async (time, mealId) => {
    try {
      // Update local state to reflect the change
      const formattedTime = time ? time.format("HH:mm") : null;
      setDefaultMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal.id === mealId
            ? { ...meal, time: [meal.time?.[0] || null, formattedTime] }
            : meal
        )
      );

      await axios.patch(
        `${urL}/meal-types/timeupdate/${mealId}/1`,
        {
          newTime: formattedTime,
        },
        {
          params: { orgId: authData?.orgId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchDefaultMeals(currentDate);
      message.success("Time Updated successfully");
    } catch (err) {
      console.error("Error changing end time:", err);
      message.error(err.response?.data?.message || "Failed to update end time");
      await fetchDefaultMeals(currentDate); // Revert on error
    }
  };

  const handleTabChange = (key) => {
    const stringKey = key.toString();
    const numericKey = parseInt(key, 10);
    setActiveTab(stringKey);
    const mealType = defaultMeals.find((meal) => meal.id === numericKey);
    if (mealType) {
      setActiveMealType(mealType);
    }
    setSelectedMeals([]);
    setExistingSchedule(null);
    setPreviousSchedules([]); // Clear previous schedules when tab changes
  };

  const goToNextDay = () => {
    const nextDay = currentDate.add(1, "day");
    setCurrentDate(nextDay);
  };

  const showAddMealModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const payload = {
          name: values.mealName,
          orgId: authData?.orgId,
          time: [
            values.startTime ? values.startTime.format("HH:mm") : null,
            values.endTime ? values.endTime.format("HH:mm") : null,
          ],
          isDefault: values.isDefault,
          date: currentDate.format("YYYY-MM-DD"),
        };
        await axios.post(`${urL}/meal-types`, payload, {
          params: { orgId: authData?.orgId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        await fetchDefaultMeals(currentDate);
        message.success("Meal type created successfully");
      } catch (err) {
        console.error("Error creating meal type:", err);
        message.error("Failed to create meal type");
      }
      setIsModalVisible(false);
    });
  };

  const showUpdateMenuModal = async () => {
    if (!activeTab) {
      message.warning("Please select a meal time first");
      return;
    }

    // Check if there's already a schedule for this meal type and date
    const existingScheduleForToday = scheduledMeals[parseInt(activeTab)];

    if (
      existingScheduleForToday &&
      existingScheduleForToday.meals &&
      existingScheduleForToday.meals.length > 0
    ) {
      // If schedule exists, show the modal
      setIsUpdateModalVisible(true);
      setSearchTerm("");
      const mealType = defaultMeals.find(
        (meal) => meal.id === parseInt(activeTab)
      );
      if (mealType) {
        setActiveMealType(mealType);
      }
      await fetchAvailableMeals();
      await fetchExistingSchedule();
      await fetchPreviousSchedules();
    } else {
      // If no schedule exists, try to auto-copy from previous day
      await handleAutoUpdateFromPrevious();
    }
  };

  // New function to automatically update menu from previous day
  const handleAutoUpdateFromPrevious = async () => {
    if (!activeTab || !currentDate) {
      message.error("Missing required information");
      return;
    }

    try {
      const mealTypeId = parseInt(activeTab);
      const mealType = defaultMeals.find((meal) => meal.id === mealTypeId);

      if (!mealType) {
        message.error("Meal type not found");
        return;
      }

      // Check previous 7 days for the same meal type schedule
      let foundPreviousSchedule = null;
      let previousDate = null;

      for (let i = 1; i <= 7; i++) {
        const checkDate = currentDate.subtract(i, "day");
        const checkDateStr = checkDate.format("YYYY-MM-DD");

        try {
          const response = await axios.get(`${urL}/schedule/${checkDateStr}`);
          if (response.data && Array.isArray(response.data)) {
            const matchingSchedule = response.data.find(
              (s) =>
                s.mealTypeId === mealTypeId && s.meals && s.meals.length > 0
            );

            if (matchingSchedule) {
              foundPreviousSchedule = matchingSchedule;
              previousDate = checkDate;
              break; // Found the most recent one, stop searching
            }
          }
        } catch (error) {
          // Continue searching if this date has no schedules
          continue;
        }
      }

      if (foundPreviousSchedule) {
        // Auto-create schedule with meals from previous day
        const payload = {
          date: currentDate.format("YYYY-MM-DD"),
          orgId: authData?.orgId,
          mealTypeId: mealTypeId,
          mealIds: foundPreviousSchedule.meals.map((meal) => meal.id),
        };

        await axios.post(`${urL}/schedule`, payload, {
          params: { orgId: authData?.orgId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        message.success(
          `${mealType.name} menu auto-updated with ${
            foundPreviousSchedule.meals.length
          } meals from ${previousDate.format("MMM DD, YYYY")}`
        );

        await fetchAllSchedules(currentDate);
      } else {
        // No previous schedule found, show the modal for manual selection
        message.info(
          `No previous ${mealType.name} schedule found in the last 7 days. Opening menu selector.`
        );
        setIsUpdateModalVisible(true);
        setSearchTerm("");
        setActiveMealType(mealType);
        await fetchAvailableMeals();
        await fetchExistingSchedule();
        await fetchPreviousSchedules();
      }
    } catch (error) {
      console.error("Error auto-updating menu:", error);
      message.error("Failed to auto-update menu. Please try manually.");

      // Fallback to showing the modal
      setIsUpdateModalVisible(true);
      setSearchTerm("");
      const mealType = defaultMeals.find(
        (meal) => meal.id === parseInt(activeTab)
      );
      if (mealType) {
        setActiveMealType(mealType);
      }
      await fetchAvailableMeals();
      await fetchExistingSchedule();
      await fetchPreviousSchedules();
    }
  };

  const handleUpdateMenuCancel = () => {
    setIsUpdateModalVisible(false);
    setSearchTerm("");
    setSelectedMeals([]);
    setPreviousSchedules([]); // Clear previous schedules when modal closes
  };

  const handleClearSchedule = async () => {
    if (!activeTab || !currentDate || !activeMealType) {
      message.error("Missing required information (date or meal type)");
      return;
    }
    if (!existingSchedule) {
      message.info(`No scheduled meals found for ${activeMealType.name}`);
      setIsUpdateModalVisible(false);
      return;
    }

    try {
      await axios.delete(`${urL}/schedule/${existingSchedule.id}`, {
        params: { orgId: authData?.orgId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success(`${activeMealType.name} menu cleared successfully`);
      setSelectedMeals([]);
      setExistingSchedule(null);
      await fetchAllSchedules(currentDate);
      setIsUpdateModalVisible(false);
      setSearchTerm("");
    } catch (error) {
      console.error("Error clearing schedule:", error);
      message.error(
        error.response?.data?.message || "Failed to clear meal schedule"
      );
    }
  };

  const handleUpdateMenuOk = async () => {
    if (!activeTab || !currentDate || !activeMealType) {
      message.error("Missing required information (date or meal type)");
      return;
    }
    if (selectedMeals.length === 0) {
      message.warning("Please select at least one meal");
      return;
    }
    const payload = {
      date: currentDate.format("YYYY-MM-DD"),
      mealTypeId: parseInt(activeTab),
      orgId: authData?.orgId,
      mealIds: selectedMeals,
    };

    setIsUpdateLoading(true); // Start loading
    try {
      if (existingSchedule) {
        await axios.patch(`${urL}/schedule/${existingSchedule.id}`, payload, {
          params: { orgId: authData?.orgId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success(`${activeMealType.name} menu updated successfully`);
      } else {
        await axios.post(`${urL}/schedule`, payload, {
          params: { orgId: authData?.orgId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success(`${activeMealType.name} menu created successfully`);
      }
      await fetchAllSchedules(currentDate);
    } catch (error) {
      console.error("Error updating menu:", error);
      message.error(
        error.response?.data?.message || "Failed to update meal schedule"
      );
    } finally {
      setIsUpdateLoading(false); // End loading
      setIsUpdateModalVisible(false);
      setSelectedMeals([]);
      setPreviousSchedules([]); // Clear previous schedules after update
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filterMeals = () => {
    if (!activeMealType) {
      return [];
    }
    const categoryName = activeMealType.name;
    const standardMealTypes = ["breakfast", "lunch", "dinner"];
    const isStandardMealType = standardMealTypes.includes(
      categoryName.toLowerCase()
    );
    let filteredByCategory;
    if (isStandardMealType) {
      filteredByCategory = availableMeals.filter(
        (meal) =>
          meal.category &&
          Array.isArray(meal.category) &&
          meal.category.some(
            (cat) => cat.toLowerCase() === categoryName.toLowerCase()
          )
      );
    } else {
      filteredByCategory = availableMeals.filter(
        (meal) =>
          meal.category &&
          Array.isArray(meal.category) &&
          meal.category.some((cat) => cat.toLowerCase() === "snack")
      );
    }
    if (searchTerm) {
      return filteredByCategory.filter((meal) =>
        meal.nameEnglish.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredByCategory;
  };

  const isShowingSnackFallback = () => {
    if (!activeMealType || !availableMeals.length) return false;
    const categoryName = activeMealType.name;
    const originalCategoryMeals = availableMeals.filter(
      (meal) =>
        meal.category &&
        Array.isArray(meal.category) &&
        meal.category.some(
          (cat) => cat.toLowerCase() === categoryName.toLowerCase()
        )
    );
    return (
      originalCategoryMeals.length === 0 &&
      categoryName.toLowerCase() !== "snack"
    );
  };

  useEffect(() => {
    fetchDefaultMeals(currentDate);
  }, [currentDate]);

  useEffect(() => {
    if (activeTab && defaultMeals.length > 0) {
      const mealType = defaultMeals.find(
        (meal) => meal.id === parseInt(activeTab)
      );
      if (mealType) {
        setActiveMealType(mealType);
      }
    }
  }, [activeTab, defaultMeals]);

  useEffect(() => {
    if (currentDate) {
      fetchAllSchedules(currentDate);
    }
  }, [currentDate]);

  useEffect(() => {
    if (activeTab && currentDate) {
      fetchExistingSchedule();
    }
  }, [activeTab, currentDate]);

  useEffect(() => {
    if (defaultMeals.length > 0 && !activeTab) {
      const firstMealId = defaultMeals[0].id;
      setActiveTab(firstMealId.toString());
      setActiveMealType(defaultMeals[0]);
    }
  }, [defaultMeals, activeTab]);

  // Validate time to ensure valid dayjs object for defaultValue
  const validateTime = (time) => {
    if (!time) return null;
    const parsed = dayjs(time, "HH:mm", true);
    if (parsed.isValid()) return parsed;
    console.warn(`Invalid time format: ${time}`);
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Meal Menu - {currentDate.format("MMMM D, YYYY")}
        </h1>
        <div className={styles.dateControls}>
          <Button
            type="text"
            className={styles.tomorrowBtn}
            onClick={goToNextDay}
          >
            Next Day <RightOutlined className={styles.rightArrow} />
          </Button>
          <DatePicker
            value={currentDate}
            onChange={handleDateChange}
            bordered={true}
            className={styles.datePicker}
            suffixIcon={<CalendarOutlined className={styles.calendarIcon} />}
            renderExtraFooter={() => "Select Date"}
            allowClear={false}
          />
        </div>
      </div>

      <div className={styles.mealTypeSelection}>
        <Button
          icon={<PlusOutlined />}
          type="text"
          className={styles.addMealBtn}
          onClick={showAddMealModal}
        >
          Add Meal Time
        </Button>

        {defaultMeals.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#666",
              background: "#f8f9fa",
              borderRadius: "8px",
              margin: "20px 0",
            }}
          >
            <div style={{ fontSize: "16px", marginBottom: "8px" }}>
              No meal types available
            </div>
            <div style={{ fontSize: "14px" }}>
              Please create a meal type to get started with meal planning
            </div>
          </div>
        ) : (
          <div className={styles.horizontalMealContainer}>
            {defaultMeals.map((meal) => (
              <div key={meal.id} className={styles.mealItems}>
                <div className={styles.boxTop}>
                  <div className={styles.boxTopLeft}>{meal.name}</div>
                  <div className={styles.boxTopRight}>
                    <Button
                      type="text"
                      icon={
                        meal.isDefault ? (
                          <PushpinFilled style={{ color: "red" }} />
                        ) : (
                          <PushpinOutlined />
                        )
                      }
                      onClick={() => handlePinMeal(meal.id)}
                      size="small"
                    />
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteMeal(meal)}
                      size="small"
                      danger
                    />
                  </div>
                </div>
                <div className={styles.timePickerGroup}>
                  <TimePicker
                    defaultValue={validateTime(meal.time?.[0])}
                    format="HH:mm"
                    onChange={(time) => handleStartTimeChange(time, meal.id)}
                    className={styles.timePicker}
                    placeholder="Start time"
                    allowClear={false}
                  />
                  <span className={styles.timePickerSeparator}>to</span>
                  <TimePicker
                    defaultValue={validateTime(meal.time?.[1])}
                    format="HH:mm"
                    onChange={(time) => handleEndTimeChange(time, meal.id)}
                    className={styles.timePicker}
                    placeholder="End time"
                    allowClear={false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.contentArea}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          className={styles.mealTabs}
          centered
        >
          {defaultMeals.map((meal) => (
            <TabPane
              tab={meal.name}
              key={meal.id.toString()}
              className={styles.tabPane}
            >
              <div className={styles.scheduledMeals}>
                {scheduledMeals[meal.id] ? (
                  <div className={styles.mealCardContainer}>
                    {scheduledMeals[meal.id].meals &&
                    scheduledMeals[meal.id].meals.length > 0 ? (
                      <div className={styles.simpleMealsContainer}>
                        {scheduledMeals[meal.id].meals.map(
                          (scheduledMeal, index) => (
                            <div
                              key={scheduledMeal.id}
                              className={styles.simpleMealItem}
                            >
                              <div className={styles.mealItemWithImage}>
                                <Avatar
                                  src={
                                    scheduledMeal.imageUrl ||
                                    scheduledMeal.image
                                  }
                                  alt={scheduledMeal.nameEnglish}
                                  size={50} // Changed from "small" to "default" (or use "large" for even bigger)
                                  className={styles.mealAvatar}
                                  style={{
                                    marginRight: "12px", // Increased from 8px to accommodate larger image
                                    flexShrink: 0,
                                  }}
                                >
                                  {scheduledMeal.nameEnglish
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                                </Avatar>

                                <span className={styles.mealName}>
                                  {scheduledMeal.nameEnglish}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className={styles.noMealsMessage}>
                        <Empty
                          description="No meals scheduled for this meal time."
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.noMealsMessage}>
                    <Empty
                      description="No meals scheduled for this day. Click 'Update Menu' to add meals."
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  </div>
                )}
              </div>
            </TabPane>
          ))}
        </Tabs>
      </div>

      <div className={styles.updateBtnContainer}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className={styles.updateBtn}
          onClick={showUpdateMenuModal}
          disabled={!activeTab}
        >
          Update Menu
        </Button>
      </div>

      <Modal
        title="Add Meal Time"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        className={styles.customMealModal}
        styles={modalStyles}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Meal Name"
            name="mealName"
            rules={[{ required: true, message: "Please enter a meal name" }]}
          >
            <Input
              placeholder="Enter meal name (e.g., Snack, Tea Time)"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Meal Time" required>
            <div style={{ display: "flex", gap: 8 }}>
              <Form.Item
                name="startTime"
                rules={[
                  { required: true, message: "Please Enter Time Duration" },
                ]}
                noStyle
              >
                <TimePicker
                  format="HH:mm"
                  className={styles.modalTimePicker}
                  placeholder="Start time"
                />
              </Form.Item>
              <span style={{ alignSelf: "center" }}>to</span>
              <Form.Item name="endTime" rules={[{ required: true }]} noStyle>
                <TimePicker
                  format="HH:mm"
                  className={styles.modalTimePicker}
                  placeholder="End time"
                />
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked" noStyle>
            <Checkbox>Default Meal</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Menu Modal with Previous Schedules */}
      <Modal
        title={`Update Menu for ${
          activeMealType?.name || "Meal"
        } - ${currentDate.format("MMMM DD, YYYY")}`}
        open={isUpdateModalVisible}
        onOk={handleUpdateMenuOk}
        onCancel={handleUpdateMenuCancel}
        width={800}
        styles={modalStyles}
        footer={[
          <Button key="clear" onClick={handleClearSchedule} danger>
            <ClearOutlined /> Clear Schedule
          </Button>,
          <Button key="cancel" onClick={handleUpdateMenuCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdateMenuOk}>
            {existingSchedule ? "Update Menu" : "Create Menu"}
          </Button>,
        ]}
      >
        {/* Previous Schedules Section */}
        {previousSchedules.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <Divider orientation="left">Copy from Previous Days</Divider>
            <div style={{ maxHeight: 150, overflowY: "auto" }}>
              {previousSchedules.slice(0, 5).map((prevSchedule, index) => (
                <Card
                  key={`${prevSchedule.date}-${index}`}
                  size="small"
                  style={{ marginBottom: 8 }}
                  bodyStyle={{ padding: "8px 12px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>
                        {dayjs(prevSchedule.date).format("MMM DD, YYYY")}
                      </strong>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {prevSchedule.schedule.meals?.length || 0} meals
                        scheduled
                      </div>
                      <div style={{ fontSize: "11px", color: "#888" }}>
                        {prevSchedule.schedule.meals
                          ?.slice(0, 3)
                          .map((meal) => meal.nameEnglish)
                          .join(", ")}
                        {prevSchedule.schedule.meals?.length > 3 && "..."}
                      </div>
                    </div>
                    <Button
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopyFromPrevious(prevSchedule)}
                      type="link"
                    >
                      Copy
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search Section */}
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder={`Search meals for ${
              activeMealType?.name || "this meal type"
            }...`}
            value={searchTerm}
            onChange={handleSearchChange}
            prefix={<SearchOutlined />}
          />
        </div>

        {/* Selected Meals Count */}
        {selectedMeals.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Tag color="blue">{selectedMeals.length} meals selected</Tag>
          </div>
        )}

        {/* Available Meals List */}
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {isShowingSnackFallback() && <div></div>}

          <List
            dataSource={filterMeals()}
            renderItem={(meal) => (
              <List.Item
                key={meal.id}
                style={{
                  padding: "8px 0",
                  backgroundColor: selectedMeals.includes(meal.id)
                    ? "#f6ffed"
                    : "transparent",
                  borderRadius: selectedMeals.includes(meal.id) ? "4px" : "0px",
                  paddingLeft: selectedMeals.includes(meal.id) ? "8px" : "0px",
                }}
              >
                <Checkbox
                  checked={selectedMeals.includes(meal.id)}
                  onChange={() => handleMealSelection(meal.id)}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Avatar
                      src={meal.image}
                      size="small"
                      style={{ backgroundColor: "#f56a00" }}
                    >
                      {meal.nameEnglish?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                      <div
                        style={{
                          fontWeight: selectedMeals.includes(meal.id)
                            ? "bold"
                            : "normal",
                        }}
                      >
                        {meal.nameEnglish}
                      </div>
                      {meal.category && (
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {Array.isArray(meal.category)
                            ? meal.category.join(", ")
                            : meal.category}
                        </div>
                      )}
                    </div>
                  </div>
                </Checkbox>
              </List.Item>
            )}
            locale={{
              emptyText: searchTerm
                ? `No meals found for "${searchTerm}"`
                : `No meals available for ${
                    activeMealType?.name || "this meal type"
                  }`,
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default MealPlanner;
