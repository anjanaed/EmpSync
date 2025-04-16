import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Card,
  List,
  Typography,
  Divider,
  DatePicker as AntDatePicker,
  Modal,
  Input,
  Checkbox,
  ConfigProvider,
  message,
  Spin,
  Empty,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import moment from "moment";
import styles from "./calender.module.css";

const { Content } = Layout;
const { Title } = Typography;

// Create a custom DatePicker component with custom theme
const DatePicker = (props) => (
  <ConfigProvider
    theme={{
      components: {
        DatePicker: {
          // Reset cell background colors
          cellActiveWithRangeBg: "transparent",
          cellHoverWithRangeBg: "transparent",
          cellBgDisabled: "transparent",
          // Only style the selected date
          cellInViewBg: "transparent",
          cellSelectedBg: "#1890ff",
          cellSelectedHoverBg: "#40a9ff",
        },
      },
    }}
  >
    <AntDatePicker {...props} />
  </ConfigProvider>
);

const MenuSets = () => {
  const [activeTab, setActiveTab] = useState("breakfast");
  const [selectedDate, setSelectedDate] = useState(moment());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isUpdatePopupVisible, setIsUpdatePopupVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [availableMeals, setAvailableMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSchedule, setFetchingSchedule] = useState(true);
  const [scheduleData, setScheduleData] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const [scheduleIds, setScheduleIds] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
  });

  // Map tab names to category names in the database
  const tabToCategoryMap = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
  };

  // Fetch available meals from API
  const fetchAvailableMeals = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/meal");
      if (!response.ok) {
        throw new Error("Failed to fetch meals");
      }
      const data = await response.json();
      // Store the full meal objects
      setAvailableMeals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching meals:", error);
      message.error("Failed to load available meals");
      // Fallback to empty array if API fails
      setAvailableMeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract the response error message
  const getErrorMessage = async (response) => {
    try {
      const data = await response.json();
      return data.message || data.error || "Unknown error occurred";
    } catch (error) {
      return "Failed to process response";
    }
  };

  // Fetch schedule data for the selected date
  // Fetch schedule data for the selected date
const fetchScheduleData = async (date) => {
  setFetchingSchedule(true);
  try {
    // Format date as required by your API (YYYY-MM-DD)
    const formattedDate = date.format("YYYY-MM-DD");
    const response = await fetch(
      `http://localhost:3000/schedule?date=${formattedDate}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch schedule");
    }

    const data = await response.json();
    console.log("Raw API response:", data);
    
    // Process the data into our format
    const newScheduleData = {
      breakfast: [],
      lunch: [],
      dinner: [],
    };
    
    // Track schedule IDs for update operations
    const newScheduleIds = {
      breakfast: null,
      lunch: null,
      dinner: null,
    };

    // Check if data exists and has the expected structure
    if (data && typeof data === 'object') {
      // Check for direct breakfast/lunch/dinner arrays on the response
      if (Array.isArray(data.breakfast)) {
        newScheduleData.breakfast = data.breakfast;
        newScheduleIds.breakfast = data.id;
      }
      
      if (Array.isArray(data.lunch)) {
        newScheduleData.lunch = data.lunch;
        newScheduleIds.lunch = data.id;
      }
      
      if (Array.isArray(data.dinner)) {
        newScheduleData.dinner = data.dinner;
        newScheduleIds.dinner = data.id;
      }
      
      // If data is an array (multiple schedule items)
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(item => {
          if (item.breakfast && Array.isArray(item.breakfast)) {
            newScheduleData.breakfast = item.breakfast;
            newScheduleIds.breakfast = item.id;
          }
          
          if (item.lunch && Array.isArray(item.lunch)) {
            newScheduleData.lunch = item.lunch;
            newScheduleIds.lunch = item.id;
          }
          
          if (item.dinner && Array.isArray(item.dinner)) {
            newScheduleData.dinner = item.dinner;
            newScheduleIds.dinner = item.id;
          }
          
          // Handle legacy format with category
          const category = item.category?.toLowerCase() || "";
          if (category === "breakfast" && item.meals) {
            newScheduleData.breakfast = Array.isArray(item.meals) 
              ? item.meals.map(meal => typeof meal === 'string' ? meal : meal.nameEnglish || meal.name || meal)
              : [];
            newScheduleIds.breakfast = item.id || null;
          } else if (category === "lunch" && item.meals) {
            newScheduleData.lunch = Array.isArray(item.meals)
              ? item.meals.map(meal => typeof meal === 'string' ? meal : meal.nameEnglish || meal.name || meal)
              : [];
            newScheduleIds.lunch = item.id || null;
          } else if (category === "dinner" && item.meals) {
            newScheduleData.dinner = Array.isArray(item.meals)
              ? item.meals.map(meal => typeof meal === 'string' ? meal : meal.nameEnglish || meal.name || meal)
              : [];
            newScheduleIds.dinner = item.id || null;
          }
        });
      }
    }

    setScheduleData(newScheduleData);
    setScheduleIds(newScheduleIds);
    console.log("Processed schedule data:", newScheduleData);
    console.log("Schedule IDs:", newScheduleIds);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    message.error("Failed to load schedule data");
  } finally {
    setFetchingSchedule(false);
  }
};

  // Effect to fetch schedule when date changes
  useEffect(() => {
    fetchScheduleData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      setIsDatePickerOpen(false);
    }
  };

  const toggleDatePicker = () => {
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Add a function to handle shifting to tomorrow
  const shiftToTomorrow = () => {
    const tomorrow = moment(selectedDate).add(1, "days");
    setSelectedDate(tomorrow);
  };

  const openUpdatePopup = async () => {
    // Set currently scheduled meals as selected
    setSelectedMeals(scheduleData[activeTab] || []);
    setIsUpdatePopupVisible(true);

    // Fetch available meals when opening the popup
    await fetchAvailableMeals();
  };

  const closeUpdatePopup = () => {
    setIsUpdatePopupVisible(false);
    setSearchText("");
  };

  const handleMenuUpdate = async () => {
    try {
      // Check if any meals are selected
      if (selectedMeals.length === 0) {
        message.error("Please select at least one meal");
        return;
      }
  
      // Format the date properly
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      
      // Create request payload with the correct structure
      // Only include the meal IDs or names for the active tab
      const updateData = {
        date: formattedDate,
        breakfast: activeTab === 'breakfast' ? selectedMeals : [],
        lunch: activeTab === 'lunch' ? selectedMeals : [],
        dinner: activeTab === 'dinner' ? selectedMeals : []
      };
  
      console.log("Sending data to API:", JSON.stringify(updateData));
  
      let response;
      const scheduleId = scheduleIds[activeTab];
      
      if (scheduleId) {
        // Update existing schedule
        response = await fetch(`http://localhost:3000/schedule/${scheduleId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
      } else {
        // Create new schedule
        response = await fetch(`http://localhost:3000/schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
      }
  
      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(`${response.status}: ${errorMessage}`);
      }
  
      // Get the response data
      const responseData = await response.json();
      
      // Update local state
      setScheduleData({
        ...scheduleData,
        [activeTab]: selectedMeals
      });
      
      if (responseData.id) {
        setScheduleIds({
          ...scheduleIds,
          [activeTab]: responseData.id
        });
      }
  
      message.success(
        `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} menu ${scheduleId ? 'updated' : 'created'} successfully`
      );
      closeUpdatePopup();
      
      // Refresh the schedule data
      fetchScheduleData(selectedDate);
    } catch (error) {
      console.error("Error updating schedule:", error);
      message.error(`Failed to ${scheduleIds[activeTab] ? 'update' : 'create'} schedule: ${error.message}`);
    }
  };
  const handleSearch = () => {
    // Search is implemented through filterMeals function
    console.log("Searching for:", searchText);
  };

  const handleMealSelection = (mealName) => {
    if (selectedMeals.includes(mealName)) {
      setSelectedMeals(selectedMeals.filter((item) => item !== mealName));
    } else {
      setSelectedMeals([...selectedMeals, mealName]);
    }
  };

  // Function to filter meals based on category and search text
  const filterMeals = () => {
    // First filter by category based on active tab
    const categoryName = tabToCategoryMap[activeTab];

    let filteredByCategory = availableMeals.filter(
      (meal) => meal.category === categoryName || meal.category === "All"
    );

    // Then filter by search text if any
    if (searchText) {
      return filteredByCategory.filter((meal) =>
        meal.nameEnglish.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filteredByCategory;
  };

  const formattedDate = selectedDate.format("MMMM D, YYYY");

  // Get the current menu items based on active tab
  const currentMenuItems = scheduleData[activeTab] || [];

  const confirmSchedule = async () => {
    try {
      const scheduleId = scheduleIds[activeTab];
      
      if (!scheduleId) {
        message.info("No schedule found to confirm");
        return;
      }
      
      const response = await fetch(`http://localhost:3000/schedule/${scheduleId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirmed: true })
      });

      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
      }

      message.success(
        `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} schedule confirmed successfully`
      );
    } catch (error) {
      console.error("Error confirming schedule:", error);
      message.error(`Failed to confirm schedule: ${error.message}`);
    }
  };

  return (
    <Card className={styles.card}>
      <div className={styles.titleContainer}>
        <Title level={3} className={styles.menuTitle}>
          Menu - {formattedDate}
        </Title>
        <div className={styles.datePickerContainer}>
          <div className={styles.buttonGroup}>
            <Button
              className={styles.tomorrowButton}
              onClick={shiftToTomorrow}
              style={{
                borderColor: "#ff4d4f",
                color: "#ff4d4f",
                marginRight: "10px",
              }}
            >
              Tomorrow
            </Button>
            <Button
              className={styles.selectDateButton}
              icon={<CalendarOutlined />}
              onClick={toggleDatePicker}
              style={{ borderColor: "#ff4d4f", color: "#ff4d4f" }}
            >
              Select Date
            </Button>
          </div>
          {isDatePickerOpen && (
            <div
              className={styles.datePickerDropdown}
              style={{
                position: "absolute",
                zIndex: 1000,
                top: "40px",
                right: "0",
              }}
            >
              <DatePicker
                open={isDatePickerOpen}
                value={selectedDate}
                onChange={handleDateChange}
                onOpenChange={(open) => {
                  if (!open) setIsDatePickerOpen(false);
                }}
                style={{ width: "280px" }}
                panelRender={(panel) => (
                  <div className={styles.customCalendarPanel}>{panel}</div>
                )}
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.customTabsContainer}>
        <div className={styles.customTabs}>
          <div
            className={`${styles.customTab} ${
              activeTab === "breakfast" ? styles.activeTab : ""
            }`}
            onClick={() => handleTabChange("breakfast")}
          >
            Breakfast Sets
          </div>
          <div
            className={`${styles.customTab} ${
              activeTab === "lunch" ? styles.activeTab : ""
            }`}
            onClick={() => handleTabChange("lunch")}
          >
            Lunch Set
          </div>
          <div
            className={`${styles.customTab} ${
              activeTab === "dinner" ? styles.activeTab : ""
            }`}
            onClick={() => handleTabChange("dinner")}
          >
            Dinner Set
          </div>
        </div>
      </div>

      <div className={styles.menuContainer}>
        {fetchingSchedule ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
            <p style={{ marginTop: "10px" }}>Loading menu schedule...</p>
          </div>
        ) : (
          <div className={styles.menuList}>
            {currentMenuItems && currentMenuItems.length > 0 ? (
              <List
                dataSource={currentMenuItems}
                renderItem={(item, index) => (
                  <>
                    <List.Item className={styles.menuItem}>
                      <Typography.Text>{item}</Typography.Text>
                    </List.Item>
                    {index < currentMenuItems.length - 1 && (
                      <Divider className={styles.divider} />
                    )}
                  </>
                )}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <Empty description="No menu scheduled for this date" />
              </div>
            )}
          </div>
        )}

        <div className={styles.actionContainer}>
          <Button
            className={styles.updateButton}
            icon={<PlusOutlined />}
            onClick={openUpdatePopup}
          >
            <span className={styles.buttonLabel}>
              {scheduleIds[activeTab] ? "Update Menu" : "Add Menu"}
            </span>
          </Button>

          <Button 
            className={styles.removeButton} 
            icon={<DeleteOutlined />}
            // onClick={handleRemoveSchedule}
            disabled={!scheduleIds[activeTab]}
          >
            <span className={styles.buttonLabel}>Remove Schedule</span>
          </Button>

          <Button 
            type="primary" 
            className={styles.confirmButton}
            onClick={confirmSchedule}
            disabled={!scheduleIds[activeTab]}
          >
            Confirm Schedule
          </Button>
        </div>
      </div>

      {/* Meal Update Popup */}
      <Modal
        title={`${scheduleIds[activeTab] ? 'Update' : 'Add'} ${
          activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
        } Menu`}
        open={isUpdatePopupVisible}
        onCancel={closeUpdatePopup}
        footer={null}
        className={styles.modal}
        width={650}
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <p className={styles.sectionTitle}>
              Available {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
              Meals
            </p>
          </div>

          <div className={styles.searchContainer}>
            <Input
              placeholder="Search meals..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={styles.searchInput}
              prefix={<SearchOutlined />}
            />
            <Button
              className={styles.searchButton}
              onClick={handleSearch}
              type="primary"
            >
              Search
            </Button>
          </div>

          <div className={styles.mealListContainer}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin size="large" />
                <p style={{ marginTop: "10px" }}>Loading available meals...</p>
              </div>
            ) : (
              <List
                className={styles.mealList}
                dataSource={filterMeals()}
                renderItem={(meal) => (
                  <>
                    <List.Item className={styles.mealItem}>
                      <div className={styles.mealItemContent}>
                        <div>
                          {meal.nameEnglish}
                          {meal.description && (
                            <div style={{ fontSize: "12px", color: "#777" }}>
                              {meal.description}
                            </div>
                          )}
                        </div>
                        <Checkbox
                          checked={selectedMeals.includes(meal.nameEnglish)}
                          onChange={() => handleMealSelection(meal.nameEnglish)}
                          className={styles.ModalCheckbox}
                        />
                      </div>
                    </List.Item>
                    <Divider className={styles.Modaldivider} />
                  </>
                )}
                locale={{
                  emptyText: (
                    <Empty
                      description={`No ${activeTab} meals found`}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
            )}
          </div>

          <div className={styles.buttonContainer}>
            <Button className={styles.cancelButton} onClick={closeUpdatePopup}>
              Cancel
            </Button>
            <Button
              type="primary"
              className={styles.updateModalButton}
              onClick={handleMenuUpdate}
              disabled={loading}
            >
              {scheduleIds[activeTab] ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default MenuSets;