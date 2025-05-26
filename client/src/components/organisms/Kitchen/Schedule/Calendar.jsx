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

const fetchDefaultMeals = async (date) => {
  setLoading(true);
  try {
    const formattedDate = date.format("YYYY-MM-DD");
    const response = await fetch(`${urL}/meal-types/by-date/${formattedDate}`);
    console.log(response);
    const data = await response.json();
    setDefaultMeals(data);
    // Set default active tab to first meal type if available

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

  // Fetch all meal schedules for the current date
  const fetchAllSchedules = async () => {
    if (!currentDate) return;
    
    setLoadingSchedules(true);
    try {
      const formattedDate = currentDate.format('YYYY-MM-DD');
      const response = await axios.get(`${urL}/schedule`, {
        params: {
          date: formattedDate
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        // Convert array of schedules to object with mealTypeId as key
        const schedulesMap = {};
        response.data.forEach(schedule => {
          schedulesMap[schedule.mealTypeId] = schedule;
        });
        setScheduledMeals(schedulesMap);
      } else {
        setScheduledMeals({});
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      message.error("Failed to load meal schedules");
      setScheduledMeals({});
    } finally {
      setLoadingSchedules(false);
    }
  };

  // Fetch existing schedule for the current date and meal type
  const fetchExistingSchedule = async () => {
    if (!activeTab || !currentDate) return;
    
    try {
      const formattedDate = currentDate.format("YYYY-MM-DD");
      const response = await axios.get(`${urL}/schedule`, {
        params: {
          date: formattedDate,
          mealTypeId: activeTab
        }
      });
      
      if (response.data && response.data.length > 0) {
        const schedule = response.data[0];
        setExistingSchedule(schedule);
        
        // Pre-select meals if there's an existing schedule
        if (schedule.mealIds && Array.isArray(schedule.mealIds)) {
          setSelectedMeals(schedule.mealIds);
        }
      } else {
        setExistingSchedule(null);
        setSelectedMeals([]);
      }
    } catch (error) {
      console.error("Error fetching existing schedule:", error);
      setExistingSchedule(null);
      setSelectedMeals([]);
    }
  };

  const handleDateChange = (date) => {
    setCurrentDate(date);
  };
  
  const modalStyles = {
    mask: {
      backdropFilter: "blur(12px)",
    },
  };

  const handleMealSelection = (mealId) => {
    if (selectedMeals.includes(mealId)) {
      setSelectedMeals(selectedMeals.filter(id => id !== mealId));
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
      console.log(err);
    }
  };

  const handleDeleteMeal = async (meal) => {
    try {
      if (!meal.isDefault) {
        await axios.delete(`${urL}/meal-types/${meal.id}`);
      }

      setDefaultMeals((prevMeals) => prevMeals.filter((m) => m.id !== meal.id));
    } catch (err) {
      console.log(err);
    }
  };

  const handleStartTimeChange = (time, meal) => {
    // Implementation of time change logic
  };

  const handleEndTimeChange = (time, meal) => {
    // Implementation of time change logic
  };

  // Convert activeTab from string to number if needed
  const handleTabChange = (key) => {
    const numericKey = typeof key === 'string' ? parseInt(key, 10) : key;
    setActiveTab(numericKey);
    
    // Find the meal type for the active tab
    const mealType = defaultMeals.find(meal => meal.id === numericKey);
    if (mealType) {
      setActiveMealType(mealType);
    }
    // Clear selected meals when changing tabs
    setSelectedMeals([]);
  };

  const goToNextDay = () => {
    setCurrentDate(currentDate.add(1, "day"));
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
          date:currentDate.format("YYYY-MM-DD"),
        };
        await axios.post(`${urL}/meal-types`, payload);
        await fetchDefaultMeals(currentDate);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
      setIsModalVisible(false);
    });
  };

  const showUpdateMenuModal = async () => {
    setIsUpdateModalVisible(true);
    setSearchTerm("");
    
    // Make sure activeMealType is set correctly before showing modal
    const mealType = defaultMeals.find(meal => meal.id === activeTab);
    if (mealType) {
      setActiveMealType(mealType);
    }
    
    // First fetch available meals, then check for existing schedule
    // This ensures meals are loaded before we try to select them
    await fetchAvailableMeals();
    await fetchExistingSchedule();
  };

  const handleUpdateMenuCancel = () => {
    setIsUpdateModalVisible(false);
    setSearchTerm("");
  };

  const handleUpdateMenuOk = async () => {
    if (!activeTab || !currentDate || !activeMealType) {
      message.error("Missing required information (date or meal type)");
      return;
    }

    const payload = {
      date: currentDate.format('YYYY-MM-DD'),
      mealTypeId: activeTab,
      mealIds: selectedMeals
    };

    setSavingSchedule(true);
    try {
      if (existingSchedule) {
        // Update existing schedule
        await axios.patch(`${urL}/schedule/${existingSchedule.id}`, payload);
        message.success(`${activeMealType.name} menu updated successfully`);
      } else {
        // Create new schedule
        await axios.post(`${urL}/schedule`, payload);
        message.success(`${activeMealType.name} menu created successfully`);
      }
      
      // Refetch all schedules to update the UI
      await fetchAllSchedules();
      
    } catch (error) {
      console.error("Error saving meal schedule:", error);
      message.error("Failed to update meal schedule");
    } finally {
      setSavingSchedule(false);
      setIsUpdateModalVisible(false);
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
    
    // First filter by category - case insensitive matching
    let filteredByCategory = availableMeals.filter(meal => 
      meal.category && 
      Array.isArray(meal.category) && 
      meal.category.some(cat => cat.toLowerCase() === categoryName.toLowerCase())
    );

    // Then filter by search term if present
    if (searchTerm) {
      return filteredByCategory.filter(meal => 
        meal.nameEnglish.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredByCategory;
  };

  useEffect(() => {
    fetchDefaultMeals(currentDate);
  }, [currentDate]);

  // Update activeMealType when activeTab or defaultMeals change
  useEffect(() => {
    const mealType = defaultMeals.find(meal => meal.id === activeTab);
    if (mealType) {
      setActiveMealType(mealType);
    }
  }, [activeTab, defaultMeals]);

  // Fetch all schedules when date changes
  useEffect(() => {
    if (currentDate) {
      fetchAllSchedules();
    }
  }, [currentDate]);

  // Fetch existing schedule when date or activeTab changes
  useEffect(() => {
    if (activeTab && currentDate) {
      fetchExistingSchedule();
    }
  }, [activeTab, currentDate]);

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
              {/* Display scheduled meals for this tab/date */}
              <div className={styles.scheduledMeals}>
                {loadingSchedules ? (
                  <div className={styles.loadingContainer}>
                    <Spin size="large" />
                    <p>Loading scheduled meals...</p>
                  </div>
                ) : scheduledMeals[meal.id] ? (
                  <div className={styles.mealCardContainer}>
                    <h2>{meal.name} Menu</h2>
                    {scheduledMeals[meal.id].meals && scheduledMeals[meal.id].meals.length > 0 ? (
                      <div className={styles.mealsGrid}>
                        {scheduledMeals[meal.id].meals.map(scheduledMeal => (
                          <Card 
                            key={scheduledMeal.id} 
                            className={styles.mealCard}
                            hoverable
                          >
                            <div className={styles.mealCardContent}>
                              {scheduledMeal.imageUrl && (
                                <Avatar 
                                  size={64} 
                                  src={scheduledMeal.imageUrl} 
                                  className={styles.mealImage}
                                />
                              )}
                              <div className={styles.mealInfo}>
                                <h3>{scheduledMeal.nameEnglish}</h3>
                                {scheduledMeal.nameSinhala && (
                                  <p className={styles.localName}>{scheduledMeal.nameSinhala}</p>
                                )}
                                {scheduledMeal.nameTamil && (
                                  <p className={styles.localName}>{scheduledMeal.nameTamil}</p>
                                )}
                                {scheduledMeal.price && (
                                  <Tag color="green">Rs. {scheduledMeal.price}</Tag>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.noMealsMessage}>
                        No meals scheduled for this meal time.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.noMealsMessage}>
                    No meals scheduled for this day. Click "Update Menu" to add meals.
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
  title={`Update ${activeMealType ? activeMealType.name : ''} Menu for ${currentDate.format("MMMM D, YYYY")}`}
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
      Available {activeMealType ? activeMealType.name : ''} Meals
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
            <List.Item 
              className={styles.mealItem}
              key={meal.id}
            >
              <div className={styles.mealItemContent}>
                <span className={styles.mealName}>{meal.nameEnglish}</span>
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
                  fetchingMeals 
                    ? "Loading..." 
                    : `No ${activeMealType ? activeMealType.name : ''} meals found`
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
        key="cancel" 
        onClick={handleUpdateMenuCancel} 
        className={styles.cancelButton}
      >
        Cancel
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