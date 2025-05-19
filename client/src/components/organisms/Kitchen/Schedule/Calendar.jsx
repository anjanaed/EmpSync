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

  const fetchDefaultMeals = async () => {
    try {
      const response = await fetch(`${urL}/meal-types/defaults`);
      const data = await response.json();
      setDefaultMeals(data);
      // Set default active tab to first meal type if available
      if (data.length > 0) {
        setActiveTab(data[0].id);
        setActiveMealType(data[0]);
        console.log(`Initial meal type set to: ${data[0].name}`);
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
      console.log(`Tab changed to: ${mealType.name}`);
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
        };
        await axios.post(`${urL}/meal-types`, payload);
        await fetchDefaultMeals();
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
    setSelectedMeals([]);
    
    // Make sure activeMealType is set correctly before showing modal
    const mealType = defaultMeals.find(meal => meal.id === activeTab);
    if (mealType) {
      setActiveMealType(mealType);
      console.log(`Update menu modal opened for: ${mealType.name}`);
    }
    
    await fetchAvailableMeals();
  };

  const handleUpdateMenuCancel = () => {
    setIsUpdateModalVisible(false);
    setSearchTerm("");
  };

  const handleUpdateMenuOk = () => {
    // Save the selected meals
    console.log("Selected meals:", selectedMeals);
    const mealName = activeMealType ? activeMealType.name : "meal";
    message.success(`${mealName} menu updated successfully`);
    setIsUpdateModalVisible(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filterMeals = () => {
    if (!activeMealType) {
      return [];
    }
    
    // Use active meal type name for proper category filtering
    const categoryName = activeMealType.name;
    console.log(`Filtering meals for category: ${categoryName}`);
    
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
    fetchDefaultMeals();
  }, []);

  // Update activeMealType when activeTab or defaultMeals change
  useEffect(() => {
    const mealType = defaultMeals.find(meal => meal.id === activeTab);
    if (mealType) {
      setActiveMealType(mealType);
    }
  }, [activeTab, defaultMeals]);

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
              {/* Tab content would go here */}
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
        title={`Update ${activeMealType ? activeMealType.name : ''} Menu`}
        open={isUpdateModalVisible}
        onCancel={handleUpdateMenuCancel}
        className={styles.mealSelectionModal}
        closable={true}
        footer={null}
        styles={modalStyles}
        width={650}
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
                  <>
                    <List.Item className={styles.mealItem}>
                      <div className={styles.mealItemContent}>
                        <div className={styles.mealName}>
                          {meal.nameEnglish}
                        </div>
                        <Checkbox
                          checked={selectedMeals.includes(meal.id)}
                          onChange={() => handleMealSelection(meal.id)}
                          className={styles.mealCheckbox}
                        />
                      </div>
                    </List.Item>
                    <Divider className={styles.modalDivider} />
                  </>
                )}
                locale={{
                  emptyText: (
                    <Empty
                      description={`No ${activeMealType ? activeMealType.name : ''} meals found`}
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
              className={styles.updateModalBtn}
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MealPlanner;