import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Tabs, Badge, Row, Col, Typography, Layout, Alert, Space, Modal } from "antd";
import { CheckCircleOutlined, CloseOutlined, LoadingOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { IoClose } from "react-icons/io5";
import { MdLanguage } from "react-icons/md";
import { RiAiGenerate } from "react-icons/ri";
import { Spin } from "antd";
import { motion } from "framer-motion";
import { useAuth } from "../../../../contexts/AuthContext";
import ResponsiveNav from "../ResponsiveNavbar/ResponsiveNav";
import styles from "./MealPage03.module.css";
import translations from "../../../../utils/translations";
import axios from "axios";

const { Content } = Layout;
const { Title, Text } = Typography;

const Loading = ({ text }) => (
  <div className={styles.loadingContainer}>
    <Spin
      indicator={<LoadingOutlined style={{ fontSize: 75, color: "#06C167" }} spin />}
    />
    {text && (
      <div className={styles.loadingText}>
        {text}
      </div>
    )}
  </div>
);

const MealPage03 = () => {
  const { authData } = useAuth();
  const userId = authData?.user?.id;
  const username = authData?.user || { name: "Guest" };
  const [baseTime, setBaseTime] = useState(null);
  const currentTimeRef = useRef(new Date());
  const [selectedDate, setSelectedDate] = useState("today");
  const [selectedMealTime, setSelectedMealTime] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [meals, setMeals] = useState([]);
  const [mealTime, setMealTime] = useState([[], []]);
  const [allMeals, setAllMeals] = useState([]);
  const [_, setRenderTrigger] = useState(0);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const language = "english";
  const text = translations[language];
  const carouselRef = useRef(null);
  const [resetPin, setResetPin] = useState(false);

  useEffect(() => {
    if (userId) {
      console.log("User ID:", userId);
    } else {
      console.log("No user id found");
    }

    const initTime = () => {
      const localTime = new Date();
      currentTimeRef.current = localTime;
      setBaseTime(localTime);
      setLoading(false);
    };

    initTime();

    const timer = setInterval(() => {
      currentTimeRef.current = new Date();
      if (currentTimeRef.current.getSeconds() === 0) {
        setRenderTrigger((prev) => prev + 1);
      }
    }, 1000);

    const fetchMealTime = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/meal-types/fetch`);
        const mealTimes = Array.isArray(res.data) ? res.data : [[], []];
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
  }, [userId]);

  useEffect(() => {
    const availableMealTimes =
      selectedDate === "today" ? mealTime[0] : mealTime[1];
    if (availableMealTimes.length > 0) {
      const validMealTime =
        availableMealTimes.find((meal) => isMealTimeAvailable(meal)) ||
        availableMealTimes[0];
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
      try {
        setLoading(true);
        const baseDate =
          selectedDate === "today"
            ? baseTime
            : new Date(baseTime.getTime() + 24 * 60 * 60 * 1000);
        const formattedDate = baseDate.toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        });

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
        console.log("Meal Details:", formattedDate, mealDetails);
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
  }, [selectedDate, selectedMealTime, baseTime]);

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString("en-IN");
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

    const [, endTimeStr] = mealTimeItem.time;
    const [endHour, endMinute] = endTimeStr.split(":").map(Number);

    const now = currentTimeRef.current;
    const endTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      endHour,
      endMinute
    );

    return now <= endTime;
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
        const { date, mealTime, meals, totalPrice } = groupedOrders[key];
        const mealsArray = Object.entries(meals).map(
          ([mealId, count]) => `${mealId}:${count}`
        );

        const orderPlacedTime = currentTimeRef.current.toISOString();
        const orderDate =
          selectedDate === "today"
            ? currentTimeRef.current.toISOString()
            : new Date(
                currentTimeRef.current.getTime() + 24 * 60 * 60 * 1000
              ).toISOString();

        const orderData = {
          employeeId: userId || "unknown",
          meals: mealsArray,
          orderDate,
          mealTypeId: mealTime,
          price: totalPrice,
          serve: false,
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
        setShowSuccess(false);
        setOrderItems([]);
        setIsCartVisible(false);
      }, 1000);
    } catch (error) {
      console.log(error);
      setShowError(true);
      setTimeout(() => setShowError(false), 1000);
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

  if (!baseTime) return <Loading text={text.loading || "Initializing..."} />;

  return (
    <>
      <ResponsiveNav />
      <div className={styles.container}>
        {loading && <Loading text={text.loading || "Loading meals..."} />}
        <Layout className={styles.layout}>
          <div className={styles.header}>
            <div className={styles.userName}>
              {username?.name || "Guest"}
            </div>
            <Button
              type="text"
              icon={<ShoppingCartOutlined />}
              className={styles.cartButton}
              onClick={() => setIsCartVisible(true)}
            >
              <Badge count={orderItems.reduce((sum, item) => sum + item.count, 0)}>
                Cart
              </Badge>
            </Button>
          </div>
          <Content className={styles.content}>
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
                bodyStyle={{ padding: "10px" }}
                title={
                  <Title level={2} className={styles.cardTitle}>
                    {text.title}
                  </Title>
                }
                className={styles.cardContainer}
              >
                <div className={styles.dateButtonGroup}>
                  <Button
                    type="default"
                    onClick={() => setSelectedDate("today")}
                    className={`${styles.dateButton} ${
                      selectedDate === "today" ? styles.selectedDateButton : ""
                    }`}
                  >
                    {text.today} ({formatDateForDisplay(baseTime)})
                  </Button>
                  <Button
                    type="default"
                    onClick={() => setSelectedDate("tomorrow")}
                    className={`${styles.dateButton} ${
                      selectedDate === "tomorrow" ? styles.selectedDateButton : ""
                    }`}
                  >
                    {text.tomorrow} (
                    {formatDateForDisplay(
                      new Date(baseTime.getTime() + 24 * 60 * 60 * 1000)
                    )}
                    )
                  </Button>
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
                            <div className={styles.loadingWrapper}>
                              <Loading text={text.loading || "Loading meals..."} />
                            </div>
                          ) : (
                            <Row gutter={[8, 8]}>
                              {meals.map((meal) => {
                                const isPastDue = !isAvailable;
                                return (
                                  <Col
                                    xs={24}
                                    sm={12}
                                    md={8}
                                    lg={6}
                                    key={meal.id}
                                    className={styles.tabContent}
                                  >
                                    <Card
                                      bodyStyle={{ padding: 8 }}
                                      cover={
                                        <img
                                          alt={
                                            meal[
                                              `name${language
                                                .charAt(0)
                                                .toUpperCase()}${language.slice(1)}`
                                            ] || "Meal"
                                          }
                                          src={
                                            meal.imageUrl ||
                                            "https://via.placeholder.com/200"
                                          }
                                          className={`${styles.mealImage} ${
                                            isPastDue ? styles.pastDueImage : ""
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
                                      hoverable={!isPastDue}
                                    >
                                      <hr className={styles.mealCardhr} />
                                      <Card.Meta
                                        title={
                                          <div>
                                            <Text className={styles.mealTitle}>
                                              {meal[
                                                `name${language
                                                  .charAt(0)
                                                  .toUpperCase()}${language.slice(1)}`
                                              ] || "Unnamed Meal"}
                                            </Text>
                                            <div className={styles.descriptionText}>
                                              {meal.description ||
                                                "No description available"}
                                            </div>
                                            <div className={styles.priceContainer}>
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
              </Card>
            )}
            <Modal
              title={
                <div className={styles.cartTitle}>
                  <ShoppingCartOutlined /> Your Cart
                </div>
              }
              visible={isCartVisible}
              onCancel={() => setIsCartVisible(false)}
              footer={null}
              className={styles.cartModal}
            >
              <div className={styles.orderSummary}>
                <Card title={<Title level={3}>{text.yourOrder}</Title>}>
                  {orderItems.length === 0 ? (
                    <Alert
                      message={text.noMealsSelected}
                      type="info"
                      showIcon
                    />
                  ) : (
  <div>
                    <Row gutter={[16, 16]}>
                      {Object.entries(
                        orderItems.reduce((acc, item) => {
                          const key = `${item.mealId}-${item.date}-${item.mealTime}`;
                          if (!acc[key]) acc[key] = { ...item, count: 0 };
                          acc[key].count += item.count;
                          return acc;
                        }, {})
                      ).map(([key, item], index) => {
                        const meal = allMeals.find(
                          (meal) => meal.id === item.mealId
                        );
                        return (
                          <Col span={24} key={index}>
                            <div className={styles.orderCard}>
                              <Row justify="space-between" align="middle">
                                <Col xs={14} sm={16}>
                                  <Text strong className={styles.orderCardTitle}>
                                    {meal
                                      ? meal[
                                          `name${language
                                            .charAt(0)
                                            .toUpperCase()}${language.slice(1)}`
                                        ] || "Unnamed Meal"
                                      : "Meal not found"}
                                  </Text>
                                  <div className={styles.orderCardDetails}>
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
                                    />
                                  </div>
                                </Col>
                                <Col xs={10} sm={8} className={styles.rightAligned}>
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
                                    <Text className={styles.itemCountBadge}>
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
                                        ? (meal.price * item.count).toFixed(2)
                                        : "0.00"}
                                    </Text>
                                  </div>
                                  <Button
                                    className={styles.removeButton}
                                    type="text"
                                    icon={<IoClose size={20} color="red" />}
                                    onClick={() => toggleOrderItem(item.mealId)}
                                  />
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                    <div className={styles.totalContainer}>
                      <Text strong className={styles.totalText}>
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
                    </div>
                  )}
                </Card>
              </div>
            </Modal>
          </Content>
        </Layout>
      </div>
    </>
  );
};

export default MealPage03;