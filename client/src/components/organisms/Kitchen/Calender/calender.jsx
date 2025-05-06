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
import "dayjs/locale/en";
import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  SearchOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import dayjs from "dayjs";
import styles from "./calender.module.css";
import enUS from "antd/es/date-picker/locale/en_US"; // Import locale directly from Ant Design

const { Content } = Layout;
const { Title } = Typography;

const CustomDatePicker = ({ value, onChange, onClose }) => {
  // Convert moment value to dayjs when setting internal state
  const [internalValue, setInternalValue] = useState(
    value ? dayjs(value.format("YYYY-MM-DD")) : null
  );

  useEffect(() => {
    // Convert moment value to dayjs when value prop changes
    setInternalValue(value ? dayjs(value.format("YYYY-MM-DD")) : null);
  }, [value]);

  const handleDateChange = (date) => {
    if (date) {
      setInternalValue(date);
      // Convert dayjs back to moment for parent component
      onChange(moment(date.format("YYYY-MM-DD")));
    }
  };

  const handleOk = () => {
    if (internalValue) {
      // Convert dayjs back to moment for parent component
      onChange(moment(internalValue.format("YYYY-MM-DD")));
      onClose();
    }
  };

  // Function to filter meals based on category and search text
  const filterMeals = () => {
    // Get category name for the active tab
    const categoryName = tabToCategoryMap[activeTab];

    // Filter meals that include the current category in their category array
    let filteredByCategory = availableMeals.filter(
      (meal) =>
        // Check if category exists and includes the active category
        meal.category &&
        Array.isArray(meal.category) &&
        meal.category.includes(categoryName)
    );

    // Then filter by search text if any
    if (searchText) {
      return filteredByCategory.filter((meal) =>
        meal.nameEnglish.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filteredByCategory;
  };

  const disabledDate = (current) => {
    if (!current) return false;

    // Only restrict dates more than 30 days in the past
    const thirtyDaysAgo = dayjs().subtract(30, "days").startOf("day");

    // Return true only for dates before 30 days ago
    return current.isBefore(thirtyDaysAgo);
  };

  return (
    <div className={styles.datePickerWrapper}>
      <ConfigProvider
        theme={{
          components: {
            DatePicker: {
              cellActiveWithRangeBg: "#fafafa",
              cellHoverWithRangeBg: "#f0f0f0",
              cellBgDisabled: "#f5f5f5",
              cellInViewBg: "#ffffff",
              cellSelectedBg: "#ff4d4f",
              cellSelectedHoverBg: "#ff7875",
            },
          },
        }}
      >
        <AntDatePicker
          value={internalValue}
          onChange={handleDateChange}
          onOk={handleOk}
          onOpenChange={(open) => !open && onClose()}
          locale={enUS}
          format="YYYY-MM-DD"
          allowClear={false}
          showToday={true}
          disabledDate={disabledDate}
          style={{
            width: "280px",
          }}
          popupStyle={{
            position: "absolute",
            zIndex: 1000,
          }}
          open={true}
          inputReadOnly={true}
          showTime={false}
          mode="date"
        />
      </ConfigProvider>
    </div>
  );
};

const MenuSets = () => {
  const [activeTab, setActiveTab] = useState("breakfast");
  const [selectedDate, setSelectedDate] = useState(moment());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isUpdatePopupVisible, setIsUpdatePopupVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [availableMeals, setAvailableMeals] = useState([]);
  const [hasExistingSchedule, setHasExistingSchedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mealList, setMealList] = useState([]); // list of meals with { id, name }
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
  // Add a new state to track whether the schedule has been confirmed
  const [isConfirmed, setIsConfirmed] = useState(false);
  // Add a state for the confirmation modal
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  // Map tab names to category names in the database
  const tabToCategoryMap = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
  };

  const showConfirmModal = async () => {
    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const response = await fetch(
        `http://localhost:3000/schedule/${formattedDate}`
      );

      if (!response.ok) {
        message.error("Failed to load schedule data for confirmation");
        return;
      }

      const data = await response.json();

      const isMenuComplete =
        data.breakfast &&
        data.breakfast.length > 0 &&
        data.lunch &&
        data.lunch.length > 0 &&
        data.dinner &&
        data.dinner.length > 0;

      if (!isMenuComplete) {
        message.warning(
          "Cannot confirm. Please complete the menu (Breakfast, Lunch, and Dinner)."
        );
        return;
      }

      // If all meal slots are filled, show the confirmation modal
      setIsConfirmModalVisible(true);
    } catch (error) {
      console.error("Error checking schedule before confirmation:", error);
      message.error("Something went wrong while checking the schedule");
    }
  };

  // Show delete confirmation dialog
  const showDeleteConfirmation = () => {
    setIsDeleteConfirmVisible(true);
  };

  // Close confirmation dialog without action
  const closeDeleteConfirmation = () => {
    setIsDeleteConfirmVisible(false);
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
      console.log("Fetched available meals:", data);
      // Store the full meal objects
      setAvailableMeals(Array.isArray(data) ? data : []);
      return data; // Return the data in case we need it
    } catch (error) {
      console.error("Error fetching meals:", error);
      message.error("Failed to load available meals");
      // Fallback to empty array if API fails
      setAvailableMeals([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleMealSelection = (meal) => {
    // Get the meal ID and ensure it's a number
    const mealId = typeof meal === 'object' ? Number(meal.id) : Number(meal);

    if (selectedMeals.includes(mealId)) {
      setSelectedMeals(selectedMeals.filter(item => item !== mealId));
    } else {
      setSelectedMeals([...selectedMeals, mealId]);
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

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/meal"); // Update if your backend URL is different
        if (!res.ok) {
          throw new Error("Failed to fetch meals");
        }
        const data = await res.json();
        setMealList(data);
        // Also set available meals so getMealNameById can use them
        setAvailableMeals(Array.isArray(data) ? data : []);
      } catch (err) {
        // console.error("Failed to fetch meals", err);
        message.error("Failed to load available meals");
      } finally {
        setLoading(false);
      }
    };

    console.log("Date changed in effect:", selectedDate.format("YYYY-MM-DD"));

    // First fetch meals, then fetch schedule
    fetchMeals().then(() => {
      fetchScheduleData(selectedDate);
    });

    setIsConfirmed(false);
  }, [selectedDate]);

  const toggleDatePicker = () => {
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  const getMealNameById = (mealId) => {
    if (!availableMeals || availableMeals.length === 0) {
      return `Loading meal information... (ID: ${mealId})`;
    }

    // Ensure we're comparing numbers
    const meal = availableMeals.find(m => m.id === Number(mealId));
    return meal ? meal.nameEnglish : `Unknown Meal (ID: ${mealId})`;
  };


  // Modified date change handler
  const handleDateChange = (date) => {
    if (date) {
      const newDate = moment(date);
      console.log("Date changed to:", newDate.format("YYYY-MM-DD"));
      setSelectedDate(newDate);
      setIsDatePickerOpen(false);

      // Fetch schedule data for the new date
      fetchScheduleData(newDate);
      // Reset confirmation status when date changes
      setIsConfirmed(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Add a function to handle shifting to tomorrow
  const shiftToTomorrow = () => {
    const tomorrow = moment(selectedDate).add(1, "days");
    setSelectedDate(tomorrow);
    // Reset confirmation status when moving to next day
    setIsConfirmed(false);
  };

  const openUpdatePopup = async () => {
    // Check if schedule is confirmed before opening the popup
    if (isConfirmed) {
      message.warning(
        "This schedule has been confirmed and cannot be updated."
      );
      return;
    }

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

  // Updated remove schedule function
  const handleRemoveSchedule = async () => {
    closeDeleteConfirmation(); // Close the confirmation dialog
    setFetchingSchedule(true); // Show loading state

    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const response = await fetch(
        `http://localhost:3000/schedule/${formattedDate}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        message.success("Schedule removed successfully");
        // Reset all states after successful deletion
        setScheduleData({
          breakfast: [],
          lunch: [],
          dinner: [],
        });
        setScheduleIds({
          breakfast: null,
          lunch: null,
          dinner: null,
        });
        setHasExistingSchedule(false);
        // Reset confirmed status as well
        setIsConfirmed(false);
      } else {
        const err = await response.text();
        message.error("Failed to remove schedule: " + err);
      }
    } catch (error) {
      console.error("Error removing schedule:", error);
      message.error("An error occurred while removing the schedule.");
    } finally {
      setFetchingSchedule(false);
    }
  };

  const fetchScheduleData = async (date) => {
    setFetchingSchedule(true);
    try {
      // Reset states at the beginning of fetch to avoid stale data
      setScheduleData({
        breakfast: [],
        lunch: [],
        dinner: [],
      });
      setScheduleIds({
        breakfast: null,
        lunch: null,
        dinner: null,
      });
      setHasExistingSchedule(false);
      // Reset confirmation status
      setIsConfirmed(false);

      // Make sure we have meals data
      let meals = availableMeals;
      if (meals.length === 0) {
        // If we don't have meal data yet, fetch it
        meals = await fetchAvailableMeals();
      }

      // Format date as required by your API (YYYY-MM-DD)
      const formattedDate = date.format("YYYY-MM-DD");
      console.log("Fetching schedule for date:", formattedDate);

      const response = await fetch(
        `http://localhost:3000/schedule/${formattedDate}`
      );

      // Handle 404 (Not Found) as a normal case, not an error
      if (response.status === 404) {
        console.log("The meal can not found");
        // Just return without showing an error message
        // The empty state is already set above
        return;
      }

      if (response.status === 400) {
        console.log("No scheduled Data for that Day");
        // Just return without showing an error message
        // The empty state is already set above
        return;
      }

      // For other non-OK responses, throw an error
      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`);
      }

      const data = await response.json();
      console.log("Schedule API response:", data);

      // Process the data based on your actual API response format
      const newScheduleData = {
        breakfast: data.breakfast || [],
        lunch: data.lunch || [],
        dinner: data.dinner || [],
      };

      const newScheduleIds = {
        breakfast: data.id,
        lunch: data.id,
        dinner: data.id,
      };

      const scheduleFound =
        newScheduleData.breakfast.length > 0 ||
        newScheduleData.lunch.length > 0 ||
        newScheduleData.dinner.length > 0;

      console.log("Processed schedule data:", newScheduleData);
      console.log("Schedule ID:", data.id);

      // Update state with the processed data
      setScheduleData(newScheduleData);
      setScheduleIds(newScheduleIds);
      setHasExistingSchedule(scheduleFound);

      // Check if schedule is confirmed (if your API provides this info)
      if (data.confirmed === true) {
        setIsConfirmed(true);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      // Only show error message for genuine errors, not for "no data found"
      message.error("Failed to load schedule data");
    } finally {
      setFetchingSchedule(false);
    }
  };

  const confirmSchedule = async () => {
    closeConfirmModal(); // Close the modal

    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD"); // Use the selected date here, make sure it's formatted properly

      if (!formattedDate) {
        message.info("No schedule found to confirm");
        return;
      }

      // Use the formatted date to send the PATCH request
      const response = await fetch(
        `http://localhost:3000/schedule/${formattedDate}/confirm`, // Use date in the URL path
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ confirmed: true }),
        }
      );

      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
      }

      // Set confirmed status to true
      setIsConfirmed(true);

      // Show success message
      message.success("Schedule confirmed successfully");

      // Refresh schedule data to ensure we have the latest state
      fetchScheduleData(selectedDate);
    } catch (error) {
      console.error("Error confirming schedule:", error);
      message.error(`Failed to confirm schedule: ${error.message}`);
    }
  };
  // Update the filterMeals function
  const filterMeals = () => {
    // Get category name for the active tab
    const categoryName = tabToCategoryMap[activeTab];

    // Filter meals that include the current category in their categories array
    let filteredByCategory = availableMeals.filter(
      (meal) =>
        meal.category &&
        Array.isArray(meal.category) &&
        meal.category.includes(categoryName)
    );

    // Then filter by search text if any
    if (searchText) {
      return filteredByCategory.filter((meal) =>
        meal.nameEnglish.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filteredByCategory;
  };

  const handleMenuUpdate = async () => {
    try {
      if (selectedMeals.length === 0) {
        message.error("Please select at least one meal");
        return;
      }
      const formattedDate = selectedDate.format("YYYY-MM-DD");

      // Prepare data for API request - now selectedMeals contains meal IDs directly
      const updateData = {
        date: formattedDate,
        breakfast:
          activeTab === "breakfast"
            ? selectedMeals
            : scheduleData.breakfast || [],
        lunch: activeTab === "lunch" ? selectedMeals : scheduleData.lunch || [],
        dinner:
          activeTab === "dinner" ? selectedMeals : scheduleData.dinner || [],
      };

      console.log("Sending data to API:", JSON.stringify(updateData));

      let response;

      if (hasExistingSchedule) {
        // Use PATCH to update existing schedule
        response = await fetch(
          `http://localhost:3000/schedule/${formattedDate}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );
      } else {
        // Use POST to create new schedule
        response = await fetch(`http://localhost:3000/schedule`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });
      }

      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(`${response.status}: ${errorMessage}`);
      }

      const responseData = await response.json();

      // Update local state
      setScheduleData({
        ...scheduleData,
        [activeTab]: selectedMeals,
      });

      // Update schedule ID if needed
      if (responseData.id) {
        setScheduleIds({
          breakfast: responseData.id,
          lunch: responseData.id,
          dinner: responseData.id,
        });
        setHasExistingSchedule(true);
      }

      message.success(
        `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} menu ${
          hasExistingSchedule ? "updated" : "added"
        } successfully`
      );

      closeUpdatePopup();
      // Refresh schedule data to ensure we have the latest
      fetchScheduleData(selectedDate);
    } catch (error) {
      console.error("Error updating schedule:", error);
      message.error(`Failed to update schedule: ${error.message}`);
    }
  };

  const handleSearch = () => {
    // Search is implemented through filterMeals function
    console.log("Searching for:", searchText);
  };

  // Add this new function to clear only the active tab's menu
  const handleClearActiveTabMenu = async () => {
    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");

      // Create update data that keeps other meals but clears the active tab
      const updateData = {
        date: formattedDate,
        breakfast:
          activeTab === "breakfast" ? [] : scheduleData.breakfast || [],
        lunch: activeTab === "lunch" ? [] : scheduleData.lunch || [],
        dinner: activeTab === "dinner" ? [] : scheduleData.dinner || [],
      };

      console.log(`Clearing ${activeTab} menu for ${formattedDate}`);

      // Only send request if we have an existing schedule
      if (hasExistingSchedule) {
        const response = await fetch(
          `http://localhost:3000/schedule/${formattedDate}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!response.ok) {
          const errorMessage = await getErrorMessage(response);
          throw new Error(`${response.status}: ${errorMessage}`);
        }

        // Update local state
        setScheduleData({
          ...scheduleData,
          [activeTab]: [], // Clear just the active tab
        });

        message.success(
          `${
            activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
          } menu cleared successfully`
        );

        // Close the modal after clearing
        closeUpdatePopup();

        // Refresh data
        fetchScheduleData(selectedDate);
      } else {
        message.info("No menu to clear for this date");
        closeUpdatePopup();
      }
    } catch (error) {
      console.error("Error clearing menu:", error);
      message.error(`Failed to clear menu: ${error.message}`);
    }
  };

  const formattedDate = selectedDate.format("MMMM D, YYYY");

  // Get the current menu items based on active tab
  const currentMenuItems = scheduleData[activeTab] || [];

  // Close confirm modal
  const closeConfirmModal = () => {
    setIsConfirmModalVisible(false);
  };

  return (
    <Card className={styles.card}>
      <div className={styles.titleContainer}>
        <Title level={3} className={styles.menuTitle}>
          Menu - {formattedDate}
          {isConfirmed && (
            <CheckCircleOutlined style={{ color: "green", marginLeft: 10 }} />
          )}
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
            <div className={styles.datePickerDropdown}>
              <CustomDatePicker
                value={selectedDate}
                onChange={(date) => {
                  console.log("Date selected:", date.format("YYYY-MM-DD"));
                  handleDateChange(date);
                }}
                onClose={() => setIsDatePickerOpen(false)}
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
                      <Typography.Text>{getMealNameById(item)}</Typography.Text>
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
            disabled={isConfirmed} // Disable update button if schedule is confirmed
          >
            <span className={styles.buttonLabel}>
              {scheduleIds[activeTab] ? "Update Menu" : "Add Menu"}
            </span>
          </Button>

          <Button
            className={styles.removeButton}
            icon={<DeleteOutlined />}
            onClick={showDeleteConfirmation}
            disabled={!hasExistingSchedule || isConfirmed} // Disable delete if confirmed
          >
            <span className={styles.buttonLabel}>Remove Schedule</span>
          </Button>

          <Button
            type="primary"
            className={styles.confirmButton}
            onClick={showConfirmModal} // Show confirmation modal first
            disabled={!scheduleIds[activeTab] || isConfirmed} // Disable if already confirmed
          >
            Confirm Schedule
          </Button>
        </div>
      </div>

      {/* Meal Update Popup */}
      <Modal
        title={`${scheduleIds[activeTab] ? "Update" : "Add"} ${
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
                          <span >
                            {meal.nameEnglish}
                          </span>
                          
                        </div>
                        <Checkbox
                          checked={selectedMeals.includes(meal.id)}
                          onChange={() => handleMealSelection(meal.id)}
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
            <Button
              className={styles.cancelButton}
              onClick={handleClearActiveTabMenu}
              disabled={!scheduleIds[activeTab]}
            >
              Clear Menu
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

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={isDeleteConfirmVisible}
        onCancel={closeDeleteConfirmation}
        footer={[
          <Button key="cancel" onClick={closeDeleteConfirmation}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={handleRemoveSchedule}
          >
            Delete
          </Button>,
        ]}
      >
        <p>
          Are you sure you want to delete the entire menu schedule for{" "}
          {selectedDate.format("MMMM D, YYYY")}?
        </p>
        <p>
          This will remove breakfast, lunch, and dinner menus for this date.
        </p>
      </Modal>

      {/* Confirm Schedule Modal */}
      <Modal
        title="Confirm Schedule"
        open={isConfirmModalVisible}
        onCancel={closeConfirmModal}
        footer={[
          <Button key="cancel" onClick={closeConfirmModal}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" onClick={confirmSchedule}>
            Confirm
          </Button>,
        ]}
      >
        <p>
          Are you sure you want to confirm the schedule for{" "}
          {selectedDate.format("MMMM D, YYYY")}?
        </p>
        <p>
          <strong>Warning:</strong> Once confirmed, you will not be able to
          update or modify this menu.
        </p>
      </Modal>
    </Card>
  );
};

export default MenuSets;
