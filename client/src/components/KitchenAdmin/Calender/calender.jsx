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
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [availableMeals, setAvailableMeals] = useState([]);
  const [hasExistingSchedule, setHasExistingSchedule] = useState(false);
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

  // Effect to fetch schedule when date changes
  useEffect(() => {
    console.log("Date changed in effect:", selectedDate.format("YYYY-MM-DD"));
    fetchScheduleData(selectedDate);
  }, [selectedDate]); // Dependency array includes selectedDate

  const handleDateChange = (date) => {
    if (date) {
      // Ensure we're using the same moment/dayjs instance type everywhere
      const newDate = moment(date);
      console.log("Date changed to:", newDate.format("YYYY-MM-DD"));
      setSelectedDate(newDate);
      setIsDatePickerOpen(false);

      // You could also force a data refresh here if needed
      // fetchScheduleData(newDate);
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
  // Improved fetchScheduleData function without error message for no data
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
    } catch (error) {
      console.error("Error fetching schedule:", error);
      // Only show error message for genuine errors, not for "no data found"
      message.error("Failed to load schedule data");
    } finally {
      setFetchingSchedule(false);
    }
  };

  // Fully updated handleMenuUpdate function
  // const handleMenuUpdate = async () => {
  //   try {
  //     if (selectedMeals.length === 0) {
  //       message.error("Please select at least one meal");
  //       return;
  //     }

  //     const formattedDate = selectedDate.format("YYYY-MM-DD");

  //     // Prepare data for API request
  //     const updateData = {
  //       date: formattedDate,
  //       breakfast:
  //         activeTab === "breakfast"
  //           ? selectedMeals
  //           : scheduleData.breakfast || [],
  //       lunch: activeTab === "lunch" ? selectedMeals : scheduleData.lunch || [],
  //       dinner:
  //         activeTab === "dinner" ? selectedMeals : scheduleData.dinner || [],
  //     };

  //     console.log("Sending data to API:", JSON.stringify(updateData));

  //     let response;

  //     // Determine if we need to create or update based on hasExistingSchedule
  //     // and also double-check by looking at the current scheduleIds
  //     const currentScheduleId = scheduleIds[activeTab];
  //     const shouldUpdate = hasExistingSchedule && currentScheduleId !== null;

  //     if (shouldUpdate) {
  //       // Use PATCH to update existing schedule
  //       console.log("Using PATCH to update existing schedule");
  //       response = await fetch(
  //         `http://localhost:3000/schedule/${formattedDate}`,
  //         {
  //           method: "PATCH",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(updateData),
  //         }
  //       );

  //       // If PATCH fails with 404 or 400, the schedule doesn't exist, so fall back to POST
  //       if (
  //         !response.ok &&
  //         (response.status === 404 || response.status === 400)
  //       ) {
  //         console.log("Schedule not found, falling back to POST");
  //         response = await fetch(`http://localhost:3000/schedule`, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(updateData),
  //         });
  //       }
  //     } else {
  //       // Use POST to create new schedule
  //       console.log("Using POST to create new schedule");
  //       response = await fetch(`http://localhost:3000/schedule`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(updateData),
  //       });
  //     }

  //     if (!response.ok) {
  //       const errorMessage = await getErrorMessage(response);
  //       throw new Error(`${response.status}: ${errorMessage}`);
  //     }

  //     const responseData = await response.json();

  //     // Update local state
  //     setScheduleData({
  //       ...scheduleData,
  //       [activeTab]: selectedMeals,
  //     });

  //     // Update schedule ID if needed
  //     if (responseData.id) {
  //       setScheduleIds({
  //         ...scheduleIds,
  //         [activeTab]: responseData.id,
  //       });
  //       setHasExistingSchedule(true);
  //     }

  //     message.success(
  //       `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} menu ${
  //         shouldUpdate ? "updated" : "added"
  //       } successfully`
  //     );

  //     closeUpdatePopup();
  //     // Refresh schedule data to ensure we have the latest
  //     fetchScheduleData(selectedDate);
  //   } catch (error) {
  //     console.error("Error updating schedule:", error);
  //     message.error(`Failed to update schedule: ${error.message}`);
  //   }
  // };

  const handleMenuUpdate = async () => {
    try {
      if (selectedMeals.length === 0) {
        message.error("Please select at least one meal");
        return;
      }

      const formattedDate = selectedDate.format("YYYY-MM-DD");

      // Prepare data for API request
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
        // Use PATCH to update existing schedule - corrected endpoint format
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
      breakfast: activeTab === 'breakfast' ? [] : scheduleData.breakfast || [],
      lunch: activeTab === 'lunch' ? [] : scheduleData.lunch || [],
      dinner: activeTab === 'dinner' ? [] : scheduleData.dinner || []
    };

    console.log(`Clearing ${activeTab} menu for ${formattedDate}`);
    
    // Only send request if we have an existing schedule
    if (hasExistingSchedule) {
      const response = await fetch(`http://localhost:3000/schedule/${formattedDate}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(`${response.status}: ${errorMessage}`);
      }

      // Update local state
      setScheduleData({
        ...scheduleData,
        [activeTab]: [] // Clear just the active tab
      });

      message.success(
        `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} menu cleared successfully`
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

      const response = await fetch(
        `http://localhost:3000/schedule/${scheduleId}/confirm`,
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

      message.success(
        `${
          activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
        } schedule confirmed successfully`
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
            onClick={showDeleteConfirmation}
            disabled={!hasExistingSchedule}
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
            {/* Changed Cancel button to Clear Menu button with onClick handler */}
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
    </Card>
  );
};

export default MenuSets;
