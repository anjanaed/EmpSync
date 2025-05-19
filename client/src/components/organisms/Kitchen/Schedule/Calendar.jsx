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
} from "antd";
import {
  PlusOutlined,
  CloseOutlined,
  CalendarOutlined,
  PushpinOutlined,
  DeleteOutlined,
  RightOutlined,
  PushpinFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./Calendar.module.css";
import { use } from "react";
import Loading from "../../../atoms/loading/loading";
import axios from "axios";

const { TabPane } = Tabs;

const MealPlanner = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const urL = import.meta.env.VITE_BASE_URL;
  const [defaultMeals, setDefaultMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("breakfast");
  const [menuItems, setMenuItems] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newMealName, setNewMealName] = useState("");
  const [form] = Form.useForm();

  const fetchDefaultMeals = async () => {
    try {
      const response = await fetch(`${urL}/meal-types/defaults`);
      const data = await response.json();
      setDefaultMeals(data);
    } catch (error) {
      console.error("Error fetching default meals:", error);
    } finally {
      setLoading(false);
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

  const handleMealSelection = (meal) => {
    const updatedMeals = [...selectedMeals];

    if (updatedMeals.includes(meal)) {
      const index = updatedMeals.indexOf(meal);
      updatedMeals.splice(index, 1);
    } else {
      updatedMeals.push(meal);
    }

    setSelectedMeals(updatedMeals);
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
    setMealTime({
      ...mealTime,
      [meal]: {
        ...mealTime[meal],
        start: time,
      },
    });
  };

  const handleEndTimeChange = (time, meal) => {
    setMealTime({
      ...mealTime,
      [meal]: {
        ...mealTime[meal],
        end: time,
      },
    });
  };

  const toggleTimePicker = (meal) => {
    setShowTimePickers({
      ...showTimePickers,
      [meal]: !showTimePickers[meal],
    });
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const removeMenuItem = (item) => {
    const updatedItems = { ...menuItems };
    updatedItems[activeTab] = updatedItems[activeTab].filter(
      (menuItem) => menuItem !== item
    );
    setMenuItems(updatedItems);
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
    console.log("Clickked OK");
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

  const removeMealTime = (mealId) => {
    const updatedSelectedMeals = selectedMeals.filter(
      (meal) => meal !== mealId
    );
    setSelectedMeals(updatedSelectedMeals);

    if (activeTab === mealId) {
      setActiveTab(updatedSelectedMeals[0] || "breakfast");
    }
  };

  const updateMenu = () => {
    console.log("Menu updated");
  };

  useEffect(() => {
    fetchDefaultMeals();
  }, []);

  useEffect(() => {
    console.log(defaultMeals);
  }, [defaultMeals]);

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
            <div className={styles.mealItems}>
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
                  value={meal.time[0] ? dayjs(meal.time[0], "HH:mm") : null}
                  format="HH:mm"
                  onChange={(time) => handleStartTimeChange(time, "breakfast")}
                  className={styles.timePicker}
                  placeholder="Start time"
                />
                <span className={styles.timePickerSeparator}>to</span>
                <TimePicker
                  value={meal.time[1] ? dayjs(meal.time[1], "HH:mm") : null}
                  format="HH:mm"
                  onChange={(time) => handleEndTimeChange(time, "breakfast")}
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
          <Tabs.TabPane
            tab={meal.name}
            key={meal.id}
            className={styles.tabPane}
          >

          </Tabs.TabPane>
        ))}
      </Tabs>
      </div>


      <div className={styles.updateBtnContainer}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className={styles.updateBtn}
          onClick={updateMenu}
        >
          Update Menu
        </Button>
      </div>

      {/* Add Custom Meal Modal */}
      <Modal
        title="Add Meal Time"
        visible={isModalVisible}
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
                  { required: true, message: "Please Enter Time Duration  " },
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
            <Checkbox placeholder="">Default Meal </Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MealPlanner;
