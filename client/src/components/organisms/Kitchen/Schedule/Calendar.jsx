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
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./Calendar.module.css";
import Loading from "../../../atoms/loading/loading";
import axios from "axios";

const { TabPane } = Tabs;

const MealPlanner = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const urL = import.meta.env.VITE_BASE_URL;
  const [defaultMeals, setDefaultMeals] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [fetchingMeals, setFetchingMeals] = useState(false);
  const [activeMealType, setActiveMealType] = useState(null);
  const [existingSchedule, setExistingSchedule] = useState(null);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduledMeals, setScheduledMeals] = useState({});
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [clearingSchedule, setClearingSchedule] = useState(false);

  const fetchDefaultMeals = async (date) => {
    setLoading(true);
    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const response = await fetch(
        `${urL}/meal-types/by-date/${formattedDate}`
      );
      const data = await response.json();
      setDefaultMeals(data);

      // Set default active tab to first meal type if available and no active tab is set
      if (data.length > 0 && !activeTab) {
        const firstMealId = data[0].id;
        setActiveTab(firstMealId.toString());
        setActiveMealType(data[0]);
      }
    } catch (error) {
      console.error("Error fetching default meals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMeals = async () => {
    setFetchingMeals(true);
    try {
      const response = await fetch(`${urL}/meal`);
      if (!response.ok) {
        throw new Error("Failed to fetch meals");
      }
      const data = await response.json();
      setAvailableMeals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching meals:", error);
      message.error("Failed to load available meals");
      setAvailableMeals([]);
    } finally {
      setFetchingMeals(false);
    }
  };

  // Fixed: Fetch all meal schedules for the current date using the correct endpoint
  const fetchAllSchedules = async (date = currentDate) => {
    if (!date) return;

    setLoadingSchedules(true);
    setScheduledMeals({});

    try {
      const formattedDate = date.format("YYYY-MM-DD");

      // Use the correct endpoint format
      const response = await axios.get(`${urL}/schedule/${formattedDate}`);

      if (response.data && Array.isArray(response.data)) {
        const schedulesMap = {};

        response.data.forEach((schedule) => {
          // Extract date from ISO string and compare
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
    } finally {
      setLoadingSchedules(false);
    }
  };

  // Fixed: Fetch existing schedule for the current date and meal type
  const fetchExistingSchedule = async () => {
    if (!activeTab || !currentDate) return;

    try {
      const formattedDate = currentDate.format("YYYY-MM-DD");

      // Use the correct endpoint to get schedules for the date
      const response = await axios.get(`${urL}/schedule/${formattedDate}`);

      if (response.data && Array.isArray(response.data)) {
        // Find schedule for the current meal type
        const schedule = response.data.find(
          (s) =>
            s.mealTypeId === parseInt(activeTab) &&
            dayjs(s.date).format("YYYY-MM-DD") === formattedDate
        );

        if (schedule) {
          setExistingSchedule(schedule);
          // Pre-select meals if there's an existing schedule
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
    // Reset active tab when date changes to ensure fresh data
    setActiveTab("");
    setActiveMealType(null);
    // Clear scheduled meals immediately when date changes
    setScheduledMeals({});
    // Clear any selected meals and existing schedule
    setSelectedMeals([]);
    setExistingSchedule(null);
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

  const handlePinMeal = async (id) => {
    try {
      await axios.patch(`${urL}/meal-types/${id}/toggle-default`);
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
        await axios.delete(`${urL}/meal-types/${meal.id}`);
      }

      setDefaultMeals((prevMeals) => prevMeals.filter((m) => m.id !== meal.id));
    } catch (err) {
      console.error("Error deleting meal:", err);
    }
  };

  const handleStartTimeChange = (time, meal) => {
    // Implementation of time change logic
  };

  const handleEndTimeChange = (time, meal) => {
    // Implementation of time change logic
  };

  // Modified handleTabChange to load existing schedule for the selected tab
  const handleTabChange = (key) => {
    const stringKey = key.toString();
    const numericKey = parseInt(key, 10);
    setActiveTab(stringKey);

    // Find the meal type for the active tab
    const mealType = defaultMeals.find((meal) => meal.id === numericKey);
    if (mealType) {
      setActiveMealType(mealType);
    }

    // Clear selected meals when switching tabs
    setSelectedMeals([]);
    setExistingSchedule(null);
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
        setLoading(true);
        const payload = {
          name: values.mealName,
          time: [
            values.startTime ? values.startTime.format("HH:mm") : null,
            values.endTime ? values.endTime.format("HH:mm") : null,
          ],
          isDefault: values.isDefault,
          date: currentDate.format("YYYY-MM-DD"),
        };
        await axios.post(`${urL}/meal-types`, payload);
        await fetchDefaultMeals(currentDate);
      } catch (err) {
        console.error("Error creating meal type:", err);
      } finally {
        setLoading(false);
      }
      setIsModalVisible(false);
    });
  };

  const showUpdateMenuModal = async () => {
    if (!activeTab) {
      message.warning("Please select a meal time first");
      return;
    }

    setIsUpdateModalVisible(true);
    setSearchTerm("");

    // Make sure activeMealType is set correctly before showing modal
    const mealType = defaultMeals.find(
      (meal) => meal.id === parseInt(activeTab)
    );
    if (mealType) {
      setActiveMealType(mealType);
    }

    // First fetch available meals, then check for existing schedule
    await fetchAvailableMeals();
    await fetchExistingSchedule();
  };

  const handleUpdateMenuCancel = () => {
    setIsUpdateModalVisible(false);
    setSearchTerm("");
    // Clear selected meals when canceling
    setSelectedMeals([]);
  };

  // NEW: Handle clear schedule functionality
  const handleClearSchedule = async () => {
    if (!activeTab || !currentDate || !activeMealType) {
      message.error("Missing required information (date or meal type)");
      return;
    }

    // Check if there's an existing schedule to clear
    if (!existingSchedule) {
      message.info(`No scheduled meals found for ${activeMealType.name}`);
      setIsUpdateModalVisible(false);
      return;
    }

    setClearingSchedule(true);
    try {
      // Delete the existing schedule
      await axios.delete(`${urL}/schedule/${existingSchedule.id}`);
      
      message.success(`${activeMealType.name} menu cleared successfully`);

      // Clear local state
      setSelectedMeals([]);
      setExistingSchedule(null);

      // Refetch all schedules to update the UI
      await fetchAllSchedules(currentDate);

      // Close the modal
      setIsUpdateModalVisible(false);
      setSearchTerm("");
    } catch (error) {
      console.error("Error clearing schedule:", error);
      message.error(
        error.response?.data?.message || "Failed to clear meal schedule"
      );
    } finally {
      setClearingSchedule(false);
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
      mealIds: selectedMeals,
    };

    setSavingSchedule(true);
    try {
      if (existingSchedule) {
        // Update existing schedule
        const response = await axios.patch(
          `${urL}/schedule/${existingSchedule.id}`,
          payload
        );
        message.success(`${activeMealType.name} menu updated successfully`);
      } else {
        // Create new schedule
        const response = await axios.post(`${urL}/schedule`, payload);
        message.success(`${activeMealType.name} menu created successfully`);
      }

      // Refetch all schedules to update the UI
      await fetchAllSchedules(currentDate);
    } catch (error) {
      console.error("Error updating menu:", error);
      message.error(
        error.response?.data?.message || "Failed to update meal schedule"
      );
    } finally {
      setSavingSchedule(false);
      setIsUpdateModalVisible(false);
      setSelectedMeals([]);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Updated filterMeals function to include snack fallback logic
  const filterMeals = () => {
    if (!activeMealType) {
      return [];
    }

    const categoryName = activeMealType.name;
    const standardMealTypes = ["breakfast", "lunch", "dinner"];

    // Check if the active meal type is one of the standard meal types
    const isStandardMealType = standardMealTypes.includes(
      categoryName.toLowerCase()
    );

    let filteredByCategory;

    if (isStandardMealType) {
      // For standard meal types (Breakfast, Lunch, Dinner), only show meals from their specific category
      filteredByCategory = availableMeals.filter(
        (meal) =>
          meal.category &&
          Array.isArray(meal.category) &&
          meal.category.some(
            (cat) => cat.toLowerCase() === categoryName.toLowerCase()
          )
      );
    } else {
      // For any other meal type names (Tea Time, Snack Time, etc.), show snack category
      filteredByCategory = availableMeals.filter(
        (meal) =>
          meal.category &&
          Array.isArray(meal.category) &&
          meal.category.some((cat) => cat.toLowerCase() === "snack")
      );
    }

    // Then filter by search term if present
    if (searchTerm) {
      return filteredByCategory.filter((meal) =>
        meal.nameEnglish.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredByCategory;
  };

  // Helper function to determine if we're showing snack meals as fallback
  const isShowingSnackFallback = () => {
    if (!activeMealType || !availableMeals.length) return false;

    const categoryName = activeMealType.name;

    // Check if original category has meals
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

  // Update activeMealType when activeTab or defaultMeals change
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

  // Fixed: Fetch all schedules when date changes
  useEffect(() => {
    if (currentDate) {
      fetchAllSchedules(currentDate);
    }
  }, [currentDate]);

  // Fetch existing schedule when activeTab changes
  useEffect(() => {
    if (activeTab && currentDate) {
      fetchExistingSchedule();
    }
  }, [activeTab, currentDate]);

  // Set default active tab when defaultMeals are loaded
  useEffect(() => {
    if (defaultMeals.length > 0 && !activeTab) {
      const firstMealId = defaultMeals[0].id;
      setActiveTab(firstMealId.toString());
      setActiveMealType(defaultMeals[0]);
    }
  }, [defaultMeals, activeTab]);

  if (loading) {
    return <Loading />;
  }

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
                  value={meal.time?.[0] ? dayjs(meal.time[0], "HH:mm") : null}
                  format="HH:mm"
                  onChange={(time) => handleStartTimeChange(time, meal.id)}
                  className={styles.timePicker}
                  placeholder="Start time"
                />
                <span className={styles.timePickerSeparator}>to</span>
                <TimePicker
                  value={meal.time?.[1] ? dayjs(meal.time[1], "HH:mm") : null}
                  format="HH:mm"
                  onChange={(time) => handleEndTimeChange(time, meal.id)}
                  className={styles.timePicker}
                  placeholder="End time"
                />
              </div>
            </div>
          ))}
        </div>
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
                {loadingSchedules ? (
                  <div className={styles.loadingContainer}>
                    <Spin size="large" />
                    <p>Loading scheduled meals...</p>
                  </div>
                ) : scheduledMeals[meal.id] ? (
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
                              {scheduledMeal.nameEnglish}
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

      {/* Add Custom Meal Modal */}
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

      {/* Update Menu Modal */}
      <Modal
        title={`Update ${
          activeMealType ? activeMealType.name : ""
        } Menu for ${currentDate.format("MMMM D, YYYY")}`}
        open={isUpdateModalVisible}
        onCancel={handleUpdateMenuCancel}
        className={styles.mealSelectionModal}
        closable={true}
        footer={null}
        styles={modalStyles}
        width={600}
      >
        <div className={styles.updateMealModalContent}>
          <h3 className={styles.modalSectionTitle}>
            Available {activeMealType ? activeMealType.name : ""} Meals
          </h3>

          <div className={styles.searchContainer}>
            <Input
              placeholder="Search meals..."
              onChange={handleSearchChange}
              className={styles.searchInput}
              value={searchTerm}
              prefix={<SearchOutlined />}
            />
          </div>

          <div className={styles.mealsContainer}>
            {fetchingMeals ? (
              <div className={styles.loadingContainer}>
                <Spin size="large" />
                <p>Loading available meals...</p>
              </div>
            ) : (
              <List
                className={styles.mealList}
                dataSource={filterMeals()}
                renderItem={(meal) => (
                  <List.Item className={styles.mealItem} key={meal.id}>
                    <div className={styles.mealItemContent}>
                      <span className={styles.mealName}>
                        {meal.nameEnglish}
                      </span>
                      <Checkbox
                        checked={selectedMeals.includes(meal.id)}
                        onChange={() => handleMealSelection(meal.id)}
                        className={styles.mealCheckbox}
                      />
                    </div>
                  </List.Item>
                )}
                locale={{
                  emptyText: (
                    <Empty
                      description={
                        fetchingMeals ? "Loading..." : `No meals found`
                      }
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
            )}
          </div>

          <div className={styles.modalFooter}>
            <Button
              key="clear"
              onClick={handleClearSchedule}
              loading={clearingSchedule}
              className={styles.clearButton}
              icon={<ClearOutlined />}
              danger
            >
              Clear
            </Button>
            <Button
              key="update"
              type="primary"
              onClick={handleUpdateMenuOk}
              loading={savingSchedule}
              className={styles.updateModalBtn}
            >
              {existingSchedule ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MealPlanner;