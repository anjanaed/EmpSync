import React, { useState } from "react";
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

  // Available meals for selection
  const availableMeals = [
    "Rice &Curry",
    "Noodles",
    "Hoppers",
    "String Hoppers",
    "Bread with Curry",
    "Milk Rice",
    "Egg Hoppers",
    "Kottu",
    "Biryani",
    "Fried Rice",
  ];

  // Menu items for each tab
  const [menuItems, setMenuItems] = useState({
    breakfast: [
      "String Hoppers",
      "Hoppers",
      "Bread with Curry",
      "Milk Rice",
      "Milk Rice",
      "Milk Rice",
      "Milk Rice",
      "Milk Rice",
      "Milk Rice",
      "Milk Rice",
      "Milk Rice",
      "Milk Rice",
      "Milk Rice",
      "Milk Rice",
      "Milk Rice",
      "Egg Hoppers",
    ],
    lunch: [
      "Rice & Curry",
      "String Hoppers",
      "Noodles",
      "Hoppers",
      "Bread with Curry",
    ],
    dinner: ["Fried Rice", "Kottu", "Rice & Curry", "Noodles", "Biryani"],
  });

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

  const openUpdatePopup = () => {
    // Initialize selected meals with current menu items
    setSelectedMeals([...menuItems[activeTab]]);
    setIsUpdatePopupVisible(true);
  };

  const closeUpdatePopup = () => {
    setIsUpdatePopupVisible(false);
    setSearchText("");
  };

  const handleMenuUpdate = () => {
    // Update the menu items for the current active tab
    setMenuItems({
      ...menuItems,
      [activeTab]: selectedMeals,
    });
    closeUpdatePopup();
  };

  const handleSearch = () => {
    console.log("Searching for:", searchText);
    // Search implementation would go here
  };

  const handleMealSelection = (meal) => {
    if (selectedMeals.includes(meal)) {
      setSelectedMeals(selectedMeals.filter((item) => item !== meal));
    } else {
      setSelectedMeals([...selectedMeals, meal]);
    }
  };

  const filterMeals = () => {
    if (!searchText) return availableMeals;
    return availableMeals.filter((meal) =>
      meal.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const formattedDate = selectedDate.format("MMMM D, YYYY");

  // Get the current menu items based on active tab
  const currentMenuItems = menuItems[activeTab] || [];

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
                marginRight: "10px" 
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
                right: "0"
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
                  <div className={styles.customCalendarPanel}>
                    {panel}
                  </div>
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
        <div className={styles.menuList}>
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
        </div>

        <div className={styles.actionContainer}>
          <Button
            className={styles.updateButton}
            icon={<PlusOutlined />}
            onClick={openUpdatePopup}
          >
            <span className={styles.buttonLabel}>Update Menu</span>
          </Button>

          <Button className={styles.removeButton} icon={<DeleteOutlined />}>
            <span className={styles.buttonLabel}>Remove Schedule</span>
          </Button>

          <Button type="primary" className={styles.confirmButton}>
            Confirm Schedule
          </Button>
        </div>
      </div>

      {/* Meal Update Popup */}
      <Modal
        title="Update Meal Plan"
        open={isUpdatePopupVisible}
        onCancel={closeUpdatePopup}
        footer={null}
        className={styles.modal}
        width={650}
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <p className={styles.sectionTitle}>Available Meals</p>
          </div>

          <div className={styles.searchContainer}>
            <Input
              placeholder="Search meals..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={styles.searchInput}
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
            <List
              className={styles.mealList}
              dataSource={filterMeals()}
              renderItem={(meal) => (
                <>
                  <List.Item className={styles.mealItem}>
                    <div className={styles.mealItemContent}>
                      <span>{meal}</span>
                      <Checkbox
                        checked={selectedMeals.includes(meal)}
                        onChange={() => handleMealSelection(meal)}
                        className={styles.ModalCheckbox}
                      />
                    </div>
                  </List.Item>
                  <Divider className={styles.Modaldivider} />
                </>
              )}
            />
          </div>

          <div className={styles.buttonContainer}>
            <Button className={styles.cancelButton} onClick={closeUpdatePopup}>
              Cancel
            </Button>
            <Button
              type="primary"
              className={styles.updateModalButton}
              onClick={handleMenuUpdate}
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default MenuSets;