import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Tabs,
  Badge,
  Row,
  Col,
  Typography,
  Layout,
  Alert,
  Space,
} from "antd";
import { CheckCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import styles from "./Page3.module.css";
import { IoClose } from "react-icons/io5";
import { MdLanguage } from "react-icons/md";
import { RiAiGenerate } from "react-icons/ri";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import DateAndTime from "../DateAndTime/DateAndTime";
import translations from "../../../../utils/translations";
import axios from "axios";

const { Content } = Layout;
const { Title, Text } = Typography;

// Simple in-memory cache for API responses
const cache = { mealTimes: null, meals: {} };

const Loading = ({ text }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 9999,
      background: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(4px)",
    }}
  >
    <Spin
      indicator={
        <LoadingOutlined style={{ fontSize: 75, color: "#5D071C" }} spin />
      }
    />
    {text && (
      <div
        style={{
          marginTop: "16px",
          fontSize: "16px",
          fontFamily: '"Figtree", sans-serif',
          color: "#5D071C",
          textAlign: "center",
        }}
      >
        {text}
      </div>
    )}
  </div>
);

const Page3 = ({
  language = "english",
  username,
  userId,
  carouselRef,
  setResetPin,
}) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("today");
  const [selectedMealTime, setSelectedMealTime] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [meals, setMeals] = useState([]);
  const [mealTime, setMealTime] = useState([[], []]);
  const [allMeals, setAllMeals] = useState([]);
  const text = translations[language];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000); // Update every 10 seconds

    const fetchMealTime = async () => {
      if (cache.mealTimes) {
        setMealTime(cache.mealTimes);
        const availableMealTimes =
          selectedDate === "today" ? cache.mealTimes[0] : cache.mealTimes[1];
        if (availableMealTimes.length > 0 && !selectedMealTime) {
          setSelectedMealTime(availableMealTimes[0].id);
        }
        return;
      }
      try {
        const res = await axios.get(`http://localhost:3000/meal-types/fetch`);
        const mealTimes = Array.isArray(res.data) ? res.data : [[], []];
        cache.mealTimes = mealTimes;
        setMealTime(mealTimes);
        const availableMealTimes =
          selectedDate === "today" ? mealTimes[0] : mealTimes[1];
        if (availableMealTimes.length > 0 && !selectedMealTime) {
          setSelectedMealTime(availableMealTimes[0].id);
        }
      } catch (error) {
        console.error("Error fetching meal times:", error);
        setMealTime([[], []]);
      }
    };
    fetchMealTime();

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const availableMealTimes =
      selectedDate === "today" ? mealTime[0] : mealTime[1];
    if (availableMealTimes.length > 0) {
      const validMealTime =
        availableMealTimes.find(
          (meal) => meal.id === selectedMealTime && isMealTimeAvailable(meal)
        ) || availableMealTimes[0];
      setSelectedMealTime(validMealTime?.id || null);
    } else {
      setSelectedMealTime(null);
    }
  }, [selectedDate, mealTime]);

  useEffect(() => {
    const fetchMeals = async () => {
      if (!selectedMealTime) {
        setMeals([]);
        return;
      }
      const cacheKey = `${selectedDate}-${selectedMealTime}`;
      if (cache.meals[cacheKey]) {
        setMeals(cache.meals[cacheKey]);
        setAllMeals((prev) => {
          const existingMealIds = new Set(prev.map((m) => m.id));
          const newMeals = cache.meals[cacheKey].filter(
            (meal) => !existingMealIds.has(meal.id)
          );
          return [...prev, ...newMeals];
        });
        return;
      }
      try {
        setLoading(true);
        const formattedDate =
          selectedDate === "today"
            ? new Date().toISOString().split("T")[0]
            : new Date(new Date().setDate(new Date().getDate() + 1))
                .toISOString()
                .split("T")[0];

        const scheduleResponse = await axios.get(
          `http://localhost:3000/schedule/${formattedDate}`
        );
        const scheduleData = Array.isArray(scheduleResponse.data)
          ? scheduleResponse.data
          : [];
        const scheduleEntry = scheduleData.find(
          (entry) =>
            (entry.mealTypeId || entry.mealType?.id) === selectedMealTime
        );
        const mealDetails =
          scheduleEntry?.meals && Array.isArray(scheduleEntry.meals)
            ? scheduleEntry.meals
            : [];
        cache.meals[cacheKey] = mealDetails;
        setMeals(mealDetails);
        setAllMeals((prev) => {
          const existingMealIds = new Set(prev.map((m) => m.id));
          const newMeals = mealDetails.filter(
            (meal) => !existingMealIds.has(meal.id)
          );
          return [...prev, ...newMeals];
        });
      } catch (error) {
        console.error("Error fetching meals:", error);
        setMeals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, [selectedDate, selectedMealTime]);

  const formatDateForDisplay = (date) => {
    // Convert to IST
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    return istDate.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
  };
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const isMealTimeAvailable = (mealTimeItem) => {
    if (selectedDate !== "today") return true;
    if (
      !mealTimeItem.time ||
      !Array.isArray(mealTimeItem.time) ||
      mealTimeItem.time.length < 2
    ) {
      return false;
    }
    const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startStr, endStr] = mealTimeItem.time;
    const [, endMinute] = endStr.split(":").map(Number);
    const endMinutes = endMinute * 60 + endMinute;
    return currentMinutes <= endMinutes;
  };

  const toggleOrderItem = (mealId) => {
    setOrderItems((prev) => {
      const exists = prev.some(
        (item) =>
          item.mealId === mealId &&
          item.mealTime === selectedMealTime &&
          item.date === selectedDate
      );
      if (exists) {
        return prev.filter(
          (item) =>
            !(
              item.mealId === mealId &&
              item.mealTime === selectedMealTime &&
              item.date === selectedDate
            )
        );
      }
      return [
        ...prev,
        { mealId, date: selectedDate, mealTime: selectedMealTime, count: 1 },
      ];
    });
  };

  const updateOrderItemCount = (mealId, date, mealTime, increment = true) => {
    setOrderItems((prev) => {
      const index = prev.findIndex(
        (item) =>
          item.mealId === mealId &&
          item.date === date &&
          item.mealTime === mealTime
      );
      if (index === -1) {
        return [...prev, { mealId, date, mealTime, count: 1 }];
      }
      const updatedItems = [...prev];
      if (increment) {
        updatedItems[index] = {
          ...updatedItems[index],
          count: updatedItems[index].count + 1,
        };
      } else if (updatedItems[index].count > 1) {
        updatedItems[index] = {
          ...updatedItems[index],
          count: updatedItems[index].count - 1,
        };
      } else {
        updatedItems.splice(index, 1);
      }
      return updatedItems;
    });
  };

  const placeOrder = async () => {
    const groupedOrders = orderItems.reduce((acc, item) => {
      const key = `${item.date}-${item.mealTime}`;
      if (!acc[key]) {
        acc[key] = {
          date: `${item.date}`,
          mealTime: item.mealTime,
          meals: {},
          totalPrice: 0,
        };
      }
      acc[key].meals[item.mealId] =
        (acc[key].meals[item.mealId] || 0) + item.count;
      const meal = allMeals.find((meal) => meal.id === item.mealId);
      acc[key].totalPrice += meal ? meal.price * item.count : 0;
      return acc;
    }, {});

    try {
      for (const key in groupedOrders) {
        const { date, mealTime, meals } = groupedOrders[key];
        const mealsArray = Object.entries(meals).map(
          ([mealId, count]) => `${mealId}:${count}`
        );

        // UTC+5:30 offset in ms
        const offsetMs = 5.5 * 60 * 60 * 1000;

        // Order placed time in UTC+5:30
        const orderPlacedTime = new Date(Date.now() + offsetMs).toISOString();

        // Order date in UTC+5:30
        let baseDate = new Date();
        if (date !== "today") {
          baseDate = new Date();
          baseDate.setDate(baseDate.getDate() + 1);
        }
        const orderDate = new Date(baseDate.getTime() + offsetMs).toISOString();

        const orderData = {
          employeeId: userId || "unknown",
          meals: mealsArray,
          orderDate,
          mealTypeId: mealTime,
          price: 0,
          serve: true,
          orderPlacedTime,
        };

        console.log(
          "Sending order payload:",
          JSON.stringify(orderData, null, 2)
        );
        const response = await axios.post(
          "http://localhost:3000/orders",
          orderData
        );

        console.log("Order response:", {
          status: response.status,
          data: response.data,
        });

        if (response.status < 200 || response.status >= 300) {
          console.error("Order failed:", {
            status: response.status,
            data: response.data,
            message: response.statusText,
          });
          throw new Error(`Failed to place order: ${response.statusText}`);
        }
      }

      setShowSuccess(true);
      setTimeout(() => {
        carouselRef.current?.goTo(1); // Go to Page 2 first
        setResetPin(true);
        setShowSuccess(false);
        setOrderItems([]);
      }, 1000);
    } catch (error) {
      console.log(error);
      setShowError(true);
      setTimeout(() => setShowError(false), 1000); // Stay on Page 3
    }
  };

  const isMealSelected = (mealId) =>
    orderItems.some(
      (item) =>
        item.mealId === mealId &&
        item.mealTime === selectedMealTime &&
        item.date === selectedDate
    );

  const availableMealTimes =
    selectedDate === "today" ? mealTime[0] : mealTime[1];

  return (
    <>
      {loading && <Loading text={text.loading || "Loading meals..."} />}
      <Layout className={styles.layout}>
        <div className={styles.header}>
          <div className={styles.name}>BizSolution</div>
          <div className={styles.dateAndTime}>
            <DateAndTime />
          </div>
          <div className={styles.userName}>
            <div>{username.name || "Guest"}</div>
          </div>
        </div>
        <Content style={{ padding: 0 }}>
          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.successContainer}
            >
              <Card className={styles.successCard}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <CheckCircleOutlined className={styles.successIcon} />
                </motion.div>
                <Title level={2} className={styles.cardTitle}>
                  {text.orderSuccess}
                </Title>
              </Card>
            </motion.div>
          ) : showError ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.errorContainer}
            >
              <Card className={styles.errorCard}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <CloseOutlined className={styles.errorIcon} />
                </motion.div>
                <Title level={2} className={styles.cardTitle}>
                  {text.orderFailed}
                </Title>
              </Card>
            </motion.div>
          ) : (
            <Card
              bodyStyle={{ padding: 10 }}
              title={
                <Title level={2} className={styles.cardTitle}>
                  {text.title}
                </Title>
              }
              className={styles.cardContainer}
            >
              <Row gutter={10}>
                <Col span={17}>
                  <div style={{ marginBottom: 5 }}>
                    <Space.Compact className={styles.dateButtonGroup}>
                      <Button
                        type="default"
                        onClick={() => setSelectedDate("today")}
                        className={`${styles.dateButton} ${
                          selectedDate === "today"
                            ? styles.selectedDateButton
                            : ""
                        }`}
                      >
                        {text.today} ({formatDateForDisplay(currentTime)})
                      </Button>
                      <Button
                        type="default"
                        onClick={() => setSelectedDate("tomorrow")}
                        className={`${styles.dateButton} ${
                          selectedDate === "tomorrow"
                            ? styles.selectedDateButton
                            : ""
                        }`}
                      >
                        {text.tomorrow} (
                        {formatDateForDisplay(getTomorrowDate())})
                      </Button>
                    </Space.Compact>
                  </div>
                  <Tabs
                    activeKey={selectedMealTime}
                    onChange={(key) => setSelectedMealTime(Number(key))}
                    tabBarStyle={{ fontWeight: "bold" }}
                    tabBarExtraContent={
                      <Button
                        type="default"
                        icon={<RiAiGenerate />}
                        onClick={() => console.log("Filter button clicked")}
                        className={styles.filterButton}
                      >
                        Suggestions
                      </Button>
                    }
                    items={availableMealTimes.map((mealTimeItem) => {
                      const isAvailable = isMealTimeAvailable(mealTimeItem);
                      const isSelected = selectedMealTime === mealTimeItem.id;
                      return {
                        key: mealTimeItem.id,
                        label: (
                          <span
                            className={`${styles.tabLabel} ${
                              !isAvailable
                                ? styles.unavailableTab
                                : isSelected
                                ? styles.selectedTab
                                : ""
                            }`}
                          >
                            {text[mealTimeItem.name] || mealTimeItem.name}
                          </span>
                        ),
                        disabled: !isAvailable,
                        children: (
                          <div className={styles.mealList}>
                            {loading ? (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  borderRadius: "8px",
                                  minHeight: "92vh",
                                }}
                              >
                                <Loading
                                  text={text.loading || "Loading meals..."}
                                />
                              </div>
                            ) : (
                              <Row gutter={8}>
                                {meals.map((meal) => {
                                  const isPastDue =
                                    selectedDate === "tomorrow"
                                      ? false
                                      : isMealTimeAvailable(mealTimeItem);
                                  return (
                                    <Col
                                      span={6}
                                      key={meal.id}
                                      className={styles.tabContent}
                                    >
                                      <Card
                                        bodyStyle={{ padding: 5 }}
                                        cover={
                                          <img
                                            alt={
                                              meal[
                                                `name${
                                                  language
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                  language.slice(1)
                                                }`
                                              ] || "Meal"
                                            }
                                            src={
                                              meal.imageUrl ||
                                              "https://via.placeholder.com/200"
                                            }
                                            className={`${styles.mealImage} ${
                                              isPastDue
                                                ? styles.pastDueImage
                                                : ""
                                            }`}
                                          />
                                        }
                                        className={`${styles.mealCard} ${
                                          isPastDue ? styles.pastDueCard : ""
                                        } ${
                                          isMealSelected(meal.id)
                                            ? styles.selectedMealCard
                                            : ""
                                        }`}
                                        onClick={() =>
                                          !isPastDue && toggleOrderItem(meal.id)
                                        }
                                        hoverable
                                      >
                                        <hr className={styles.mealCardhr} />
                                        <Card.Meta
                                          title={
                                            <div>
                                              <Text
                                                className={styles.mealTitle}
                                              >
                                                {meal[
                                                  `name${
                                                    language
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                    language.slice(1)
                                                  }`
                                                ] || "Unnamed Meal"}
                                              </Text>
                                              <div
                                                className={
                                                  styles.descriptionText
                                                }
                                              >
                                                {meal.description ||
                                                  "No description available"}
                                              </div>
                                              <div
                                                className={
                                                  styles.priceContainer
                                                }
                                              >
                                                <Text
                                                  strong
                                                  className={styles.priceText}
                                                >
                                                  Rs.{" "}
                                                  {meal.price
                                                    ? meal.price.toFixed(2)
                                                    : "0.00"}
                                                </Text>
                                              </div>
                                            </div>
                                          }
                                        />
                                      </Card>
                                    </Col>
                                  );
                                })}
                              </Row>
                            )}
                          </div>
                        ),
                      };
                    })}
                  />
                </Col>
                <Col span={7}>
                  <div className={styles.orderSummaryContainer}>
                    <div className={styles.orderSummary}>
                      <Card title={<Title level={3}>{text.yourOrder}</Title>}>
                        {orderItems.length === 0 ? (
                          <Alert
                            message={text.noMealsSelected}
                            type="info"
                            showIcon
                          />
                        ) : (
                          <Row gutter={[16, 16]}>
                            {Object.entries(
                              orderItems.reduce((acc, item) => {
                                const key = `${item.mealId}-${item.date}-${item.mealTime}`;
                                if (!acc[key]) acc[key] = { ...item, count: 0 };
                                acc[key].count += 1;
                                return acc;
                              }, {})
                            ).map(([key, item], index) => {
                              const meal = allMeals.find(
                                (meal) => meal.id === item.mealId
                              );
                              return (
                                <Col span={24} key={index}>
                                  <div className={styles.orderCard}>
                                    <Row justify="space-between">
                                      <Col
                                        span={10}
                                        style={{ textAlign: "left" }}
                                      >
                                        <Text strong style={{ fontSize: 15 }}>
                                          {meal
                                            ? meal[
                                                `name${
                                                  language
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                  language.slice(1)
                                                }`
                                              ] || "Unnamed Meal"
                                            : "Meal not found"}
                                        </Text>
                                      </Col>
                                      <Col
                                        span={4}
                                        style={{ textAlign: "right" }}
                                      >
                                        <Button
                                          className={styles.removeButton}
                                          type="text"
                                          icon={
                                            <IoClose size={20} color="red" />
                                          }
                                          onClick={() =>
                                            toggleOrderItem(item.mealId)
                                          }
                                        />
                                      </Col>
                                    </Row>
                                    <Row
                                      gutter={[16, 16]}
                                      className={styles.secondRow}
                                    >
                                      <Col
                                        className={styles.orderInfo}
                                        span={12}
                                      >
                                        <Badge
                                          status="processing"
                                          text={
                                            item.date === "today"
                                              ? text.today
                                              : text.tomorrow
                                          }
                                        />
                                        <Badge
                                          status="success"
                                          text={
                                            availableMealTimes.find(
                                              (m) => m.id === item.mealTime
                                            )?.name || "Unknown Meal Time"
                                          }
                                          className={styles.mealTimeBadge}
                                        />
                                      </Col>
                                      <Col
                                        span={12}
                                        className={styles.rightAligned}
                                      >
                                        <div className={styles.counter}>
                                          <Button
                                            type="text"
                                            onClick={() =>
                                              updateOrderItemCount(
                                                meal?.id,
                                                item.date,
                                                item.mealTime,
                                                false
                                              )
                                            }
                                            className={styles.actionButton}
                                          >
                                            -
                                          </Button>
                                          <Text
                                            className={styles.itemCountBadge}
                                          >
                                            {item.count}
                                          </Text>
                                          <Button
                                            type="text"
                                            onClick={() =>
                                              updateOrderItemCount(
                                                meal?.id,
                                                item.date,
                                                item.mealTime,
                                                true
                                              )
                                            }
                                            className={styles.actionButton}
                                          >
                                            +
                                          </Button>
                                        </div>
                                        <div className={styles.priceDiv}>
                                          <Text strong>
                                            Rs.{" "}
                                            {meal
                                              ? (
                                                  meal.price * item.count
                                                ).toFixed(2)
                                              : "0.00"}
                                          </Text>
                                        </div>
                                      </Col>
                                    </Row>
                                    <hr
                                      style={{ margin: "20px 0px 5px 0px" }}
                                    />
                                  </div>
                                </Col>
                              );
                            })}
                          </Row>
                        )}
                      </Card>
                    </div>
                    <Button
                      type="primary"
                      block
                      size="large"
                      onClick={placeOrder}
                      disabled={orderItems.length === 0}
                      className={`${styles.placeOrderButton} ${
                        orderItems.length === 0
                          ? styles.disabledButton
                          : styles.enabledButton
                      }`}
                    >
                      {text.placeOrder}
                    </Button>
                    <div className={styles.totalContainer}>
                      <Text strong>
                        Total: Rs.{" "}
                        {orderItems
                          .reduce((total, item) => {
                            const meal = allMeals.find(
                              (meal) => meal.id === item.mealId
                            );
                            return total + (meal ? meal.price * item.count : 0);
                          }, 0)
                          .toFixed(2)}
                      </Text>
                      <Button
                        onClick={() => carouselRef.current.goTo(0)}
                        className={styles.backButton}
                      >
                        <MdLanguage size={20} /> <div>{text.back}</div>
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          )}
        </Content>
      </Layout>
    </>
  );
};

export default Page3;
