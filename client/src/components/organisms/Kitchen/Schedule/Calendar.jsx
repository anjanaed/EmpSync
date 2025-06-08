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
  const { authData } = useAuth();
  const token = authData?.accessToken;

  const fetchDefaultMeals = async (date) => {
    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const response = await fetch(
        `${urL}/meal-types/by-date/${formattedDate}`
      );
      const data = await response.json();
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
    }
  };

  const fetchAllSchedules = async (date = currentDate) => {
    if (!date) return;
    setScheduledMeals({});
    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const response = await axios.get(`${urL}/schedule/${formattedDate}`);
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

  const fetchExistingSchedule = async () => {
    if (!activeTab || !currentDate) return;
    try {
      const formattedDate = currentDate.format("YYYY-MM-DD");
      const response = await axios.get(`${urL}/schedule/${formattedDate}`);
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
      await axios.patch(`${urL}/meal-types/${id}/toggle-default`, {
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
      
      await axios.patch(`${urL}/meal-types/timeupdate/${mealId}/0`, {
        newTime: formattedTime,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      
      await axios.patch(`${urL}/meal-types/timeupdate/${mealId}/1`, {
        newTime: formattedTime,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
          time: [
            values.startTime ? values.startTime.format("HH:mm") : null,
            values.endTime ? values.endTime.format("HH:mm") : null,
          ],
          isDefault: values.isDefault,
          date: currentDate.format("YYYY-MM-DD"),
        };
        await axios.post(`${urL}/meal-types`, payload, {
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
  };

  const handleUpdateMenuCancel = () => {
    setIsUpdateModalVisible(false);
    setSearchTerm("");
    setSelectedMeals([]);
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
      mealIds: selectedMeals,
    };
    
    try {
      if (existingSchedule) {
        await axios.patch(`${urL}/schedule/${existingSchedule.id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success(`${activeMealType.name} menu updated successfully`);
      } else {
        await axios.post(`${urL}/schedule`, payload, {
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
      setIsUpdateModalVisible(false);
      setSelectedMeals([]);
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
                    description="No meals found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          </div>
          <div className={styles.modalFooter}>
            <Button
              key="clear"
              onClick={handleClearSchedule}
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