import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
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
  CheckCircleFilled,
  RightOutlined,
} from "@ant-design/icons";
import moment from "moment";
import dayjs from "dayjs";
import styles from "./Calendar.module.css";
import enUS from "antd/es/date-picker/locale/en_US";

const CustomDatePicker = ({ value, onChange, onClose }) => {
  const [internalValue, setInternalValue] = useState(
    value ? dayjs(value.format("YYYY-MM-DD")) : null
  );

  useEffect(() => {
    setInternalValue(value ? dayjs(value.format("YYYY-MM-DD")) : null);
  }, [value]);

  const handleDateChange = (date) => {
    if (date) {
      setInternalValue(date);
      onChange(moment(date.format("YYYY-MM-DD")));
    }
  };

  const handleOk = () => {
    if (internalValue) {
      onChange(moment(internalValue.format("YYYY-MM-DD")));
      onClose();
    }
  };

  const disabledDate = (current) => {
    if (!current) return false;
    const thirtyDaysAgo = dayjs().subtract(30, "days").startOf("day");
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
  const [mealList, setMealList] = useState([]);
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
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

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

      setIsConfirmModalVisible(true);
    } catch (error) {
      console.error("Error checking schedule before confirmation:", error);
      message.error("Something went wrong while checking the schedule");
    }
  };

  const showDeleteConfirmation = () => {
    setIsDeleteConfirmVisible(true);
  };

  const closeDeleteConfirmation = () => {
    setIsDeleteConfirmVisible(false);
  };

  const fetchAvailableMeals = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/meal");
      if (!response.ok) {
        throw new Error("Failed to fetch meals");
      }
      const data = await response.json();
      console.log("Fetched available meals:", data);
      setAvailableMeals(Array.isArray(data) ? data : []);
      return data;
    } catch (error) {
      console.error("Error fetching meals:", error);
      message.error("Failed to load available meals");
      setAvailableMeals([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleMealSelection = (meal) => {
    const mealId = typeof meal === "object" ? Number(meal.id) : Number(meal);

    if (selectedMeals.includes(mealId)) {
      setSelectedMeals(selectedMeals.filter((item) => item !== mealId));
    } else {
      setSelectedMeals([...selectedMeals, mealId]);
    }
  };

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
        const res = await fetch("http://localhost:3000/meal");
        if (!res.ok) {
          throw new Error("Failed to fetch meals");
        }
        const data = await res.json();
        setMealList(data);
        setAvailableMeals(Array.isArray(data) ? data : []);
      } catch (err) {
        message.error("Failed to load available meals");
      } finally {
        setLoading(false);
      }
    };

    console.log("Date changed in effect:", selectedDate.format("YYYY-MM-DD"));

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

    const meal = availableMeals.find((m) => m.id === Number(mealId));
    return meal ? meal.nameEnglish : `Unknown Meal (ID: ${mealId})`;
  };

  const handleDateChange = (date) => {
    if (date) {
      const newDate = moment(date);
      console.log("Date changed to:", newDate.format("YYYY-MM-DD"));
      setSelectedDate(newDate);
      setIsDatePickerOpen(false);
      fetchScheduleData(newDate);
      setIsConfirmed(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const shiftToTomorrow = () => {
    const tomorrow = moment(selectedDate).add(1, "days");
    setSelectedDate(tomorrow);
    setIsConfirmed(false);
  };

  const openUpdatePopup = async () => {
    if (isConfirmed) {
      message.warning(
        "This schedule has been confirmed and cannot be updated."
      );
      return;
    }

    setSelectedMeals(scheduleData[activeTab] || []);
    setIsUpdatePopupVisible(true);
    await fetchAvailableMeals();
  };

  const closeUpdatePopup = () => {
    setIsUpdatePopupVisible(false);
    setSearchText("");
  };

  const handleRemoveSchedule = async () => {
    closeDeleteConfirmation();
    setFetchingSchedule(true);

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
      setIsConfirmed(false);

      let meals = availableMeals;
      if (meals.length === 0) {
        meals = await fetchAvailableMeals();
      }

      const formattedDate = date.format("YYYY-MM-DD");
      console.log("Fetching schedule for date:", formattedDate);

      const response = await fetch(
        `http://localhost:3000/schedule/${formattedDate}`
      );

      if (response.status === 404 || response.status === 400) {
        console.log("No scheduled data for that day");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`);
      }

      const data = await response.json();
      console.log("Schedule API response:", data);

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

      setScheduleData(newScheduleData);
      setScheduleIds(newScheduleIds);
      setHasExistingSchedule(scheduleFound);

      if (data.confirmed === true) {
        setIsConfirmed(true);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      message.error("Failed to load schedule data");
    } finally {
      setFetchingSchedule(false);
    }
  };

  const confirmSchedule = async () => {
    closeConfirmModal();

    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");

      if (!formattedDate) {
        message.info("No schedule found to confirm");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/schedule/${formattedDate}/confirm`,
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

      setIsConfirmed(true);
      message.success("Schedule confirmed successfully");
      fetchScheduleData(selectedDate);
    } catch (error) {
      console.error("Error confirming schedule:", error);
      message.error(`Failed to confirm schedule: ${error.message}`);
    }
  };

  const filterMeals = () => {
    const categoryName = tabToCategoryMap[activeTab];

    let filteredByCategory = availableMeals.filter(
      (meal) =>
        meal.category &&
        Array.isArray(meal.category) &&
        meal.category.includes(categoryName)
    );

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

      setScheduleData({
        ...scheduleData,
        [activeTab]: selectedMeals,
      });

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
      fetchScheduleData(selectedDate);
    } catch (error) {
      console.error("Error updating schedule:", error);
      message.error(`Failed to update schedule: ${error.message}`);
    }
  };

  const handleSearch = () => {
    console.log("Searching for:", searchText);
  };

  const handleClearActiveTabMenu = async () => {
    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");

      const updateData = {
        date: formattedDate,
        breakfast:
          activeTab === "breakfast" ? [] : scheduleData.breakfast || [],
        lunch: activeTab === "lunch" ? [] : scheduleData.lunch || [],
        dinner: activeTab === "dinner" ? [] : scheduleData.dinner || [],
      };

      console.log(`Clearing ${activeTab} menu for ${formattedDate}`);

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

        setScheduleData({
          ...scheduleData,
          [activeTab]: [],
        });

        message.success(
          `${
            activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
          } menu cleared successfully`
        );

        closeUpdatePopup();
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
  const currentMenuItems = scheduleData[activeTab] || [];
  const closeConfirmModal = () => {
    setIsConfirmModalVisible(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Menu - {formattedDate}</h1>
          {isConfirmed && <CheckCircleFilled className={styles.confirmIcon} />}
        </div>
        <div className={styles.dateActions}>
          <button className={styles.tomorrowBtn} onClick={shiftToTomorrow}>
            Tomorrow
            <RightOutlined />
          </button>
          <button className={styles.datePickerBtn} onClick={toggleDatePicker}>
            <CalendarOutlined /> Select Date
          </button>
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

      <div className={styles.tabs}>
        <div
          className={`${styles.tab} ${
            activeTab === "breakfast" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("breakfast")}
        >
          Breakfast Sets
        </div>
        <div
          className={`${styles.tab} ${
            activeTab === "lunch" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("lunch")}
        >
          Lunch Set
        </div>
        <div
          className={`${styles.tab} ${
            activeTab === "dinner" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("dinner")}
        >
          Dinner Set
        </div>
      </div>

      <div className={styles.menuContent}>
        {fetchingSchedule ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
            <p>Loading menu schedule...</p>
          </div>
        ) : (
          <>
            {currentMenuItems && currentMenuItems.length > 0 ? (
              <div className={styles.menuItems}>
                {currentMenuItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <div className={styles.menuItem}>
                      {getMealNameById(item)}
                    </div>
                    {index < currentMenuItems.length - 1 && (
                      <div className={styles.divider}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Empty description="No menu scheduled for this date" />
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.updateMenuBtn}>
        <Button
          icon={<PlusOutlined />}
          onClick={openUpdatePopup}
          disabled={isConfirmed}
        >
          Update Menu
        </Button>
      </div>

      <div className={styles.scheduleActions}>
        {/* <div className={styles.actionLabel}>Schedule Actions:</div> */}
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={showDeleteConfirmation}
          disabled={!hasExistingSchedule || isConfirmed}
          className={styles.removeBtn}
        >
          Remove Schedule
        </Button>
        <Button
          type="primary"
          onClick={showConfirmModal}
          disabled={!scheduleIds[activeTab] || isConfirmed}
          className={styles.confirmBtn}
        >
          Confirm Schedule
        </Button>
      </div>

      {/* Meal Update Modal */}
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
        <div className={styles.modalContainer}>
          <div className={styles.modalHeader}>
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
                      description={`No ${activeTab} meals found`}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
            )}
          </div>

          <div className={styles.modalButtonContainer}>
            <Button
              className={styles.clearButton}
              onClick={handleClearActiveTabMenu}
              disabled={!scheduleIds[activeTab]}
            >
              Clear Menu
            </Button>

            <Button
              type="primary"
              className={styles.saveButton}
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
    </div>
  );
};
export default MenuSets;
