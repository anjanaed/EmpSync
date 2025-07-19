import React, { useState, useEffect, useRef } from "react";
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
  Modal,
} from "antd";
import { CheckCircleOutlined, CloseOutlined, LogoutOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import styles from "./Page3.module.css";
import { IoClose } from "react-icons/io5";
import { MdLanguage, MdTranslate } from "react-icons/md";
import { RiAiGenerate } from "react-icons/ri";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import translations from "../../../../utils/translations";
import { useAuth } from "../../../../contexts/AuthContext";
import axios from "axios";
import DateAndTime from "../DateAndTime/DateAndTime";

const { Content } = Layout;
const { Title, Text } = Typography;

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
  const { authData } = useAuth();
  const baseURL = import.meta.env.VITE_BASE_URL;
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
  const [_, setRenderTrigger] = useState(0); // For forcing re-render
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const text = translations[language];

  // Get organizationId from username prop
  const organizationId = username?.organizationId;

  // Debug log to verify organizationId is received
  useEffect(() => {
    console.log("Page3 received username:", username);
    console.log("Page3 received organizationId:", organizationId);
    console.log("Page3 received userId:", userId);
  }, [username, organizationId, userId]);

  useEffect(() => {
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

    return () => clearInterval(timer);
  }, []);

  // Separate useEffect for fetching meal times when organizationId is available
  useEffect(() => {
    const fetchMealTime = async () => {
      try {
        // Add organizationId parameter if available
        const url = organizationId 
          ? `${baseURL}/meal-types/fetch?orgId=${organizationId}`
          : `${baseURL}/meal-types/fetch`;
        
        const res = await axios.get(url);
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

    if (organizationId) {
      fetchMealTime();
    }
  }, [organizationId, selectedDate]);

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
      if (!selectedMealTime || !organizationId) {
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

        // Add organizationId parameter to the schedule API call
        const scheduleResponse = await axios.get(
          `${baseURL}/schedule/${formattedDate}?orgId=${organizationId}`
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
  }, [selectedDate, selectedMealTime, baseTime, organizationId]);

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
    console.log(mealTimeItem.name, endTimeStr);
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

  const fetchMealSuggestions = async () => {
    if (!userId || !selectedMealTime || !organizationId) {
      console.log("Missing userId, selectedMealTime, or organizationId for suggestions");
      return;
    }

    setLoadingSuggestions(true);

    try {
      const baseDate =
        selectedDate === "today"
          ? baseTime
          : new Date(baseTime.getTime() + 24 * 60 * 60 * 1000);
      const formattedDate = baseDate.toLocaleDateString("en-CA");

      const response = await axios.get(
        `${baseURL}/meal/suggestions/${userId}`,
        {
          params: {
            date: formattedDate,
            mealTypeId: selectedMealTime,
            orgId: organizationId,
          },
        }
      );

      console.log("Suggestions response:", response.data);
      setSuggestions(response.data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching meal suggestions:", error);
      
      if (error.response?.status === 404) {
        // No meals scheduled for this date/time
        if (error.response.data?.message?.includes("No meals found")) {
          setSuggestions([]);
          setShowSuggestions(true); // Still show modal with "no suggestions" message
        } else {
          console.error("User not found for suggestions");
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(true);
      }
    } finally {
      setLoadingSuggestions(false);
    }
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
          orgId: organizationId,
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
          `${baseURL}/orders`,
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
        carouselRef.current?.goTo(1);
        setResetPin(true);
        setShowSuccess(false);
        setOrderItems([]);
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

  // Only show loading animations if user has actually progressed to Page3 (has userId)
  // This prevents loading animations when going back to Page1/Page2
  if (!userId) return null;

  if (!baseTime) return <Loading text={text.loading || "Initializing..."} />;
  
  // Wait for organizationId to be available
  if (!organizationId) return <Loading text="Loading organization data..." />;

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
                        {text.today} ({formatDateForDisplay(baseTime)})
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
                        {formatDateForDisplay(
                          new Date(baseTime.getTime() + 24 * 60 * 60 * 1000)
                        )}
                        )
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
                        onClick={fetchMealSuggestions}
                        className={styles.filterButton}
                        loading={loadingSuggestions}
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
                                  const isPastDue = !isAvailable;
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
                                        hoverable={!isPastDue}
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
                                              <br />
                                              <div
                                                className={
                                                  styles.descriptionText
                                                }
                                              >
                                                {meal.description ||
                                                  "No description available"}
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
                    <div>
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
                        {" "}
                      </Text>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          onClick={() => {
                            // Set a flag in sessionStorage to indicate special redirect
                            sessionStorage.setItem('redirectToPage3', 'true');
                            carouselRef.current?.goTo(0);
                          }}
                          className={styles.backButton}
                        >
                          <MdTranslate size={20} /> 
                        </Button>
                        <Button
                          onClick={() => {
                            setResetPin(true);
                            carouselRef.current?.goTo(1);
                          }}
                          className={styles.backButton}
                          icon={<LogoutOutlined />}
                        >
                          Logout
                        </Button>
                        
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          )}
        </Content>

        {/* Meal Suggestions Modal */}
        <Modal
          title={
            <div className={styles.suggestionsTitle}>
              <RiAiGenerate /> Meal Suggestions
            </div>
          }
          visible={showSuggestions}
          onCancel={() => setShowSuggestions(false)}
          footer={null}
          className={styles.suggestionsModal}
          width={800}
        >
          <div className={styles.suggestionsContent}>
            {loadingSuggestions ? (
              <div className={styles.loadingWrapper}>
                <Loading text="Getting personalized suggestions..." />
              </div>
            ) : suggestions.length === 0 ? (
              <Alert
                message="No suggestions available"
                description={`We couldn't generate personalized suggestions for this ${mealTime[selectedDate === "today" ? 0 : 1].find(m => m.id === selectedMealTime)?.name || 'meal time'} on ${selectedDate === 'today' ? 'today' : 'tomorrow'}. This might be because no meals are scheduled for this time, or you may need to add height and weight to your profile for personalized recommendations.`}
                type="info"
                showIcon
              />
            ) : (
              <div className={styles.suggestionsList}>
                <Typography.Text className={styles.suggestionsDescription}>
                  Based on your BMI, order history, and nutritional preferences, here are our recommendations:
                </Typography.Text>
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  {suggestions.map((suggestion, index) => {
                    const meal = meals.find(m => m.id === suggestion.mealId);
                    if (!meal) return null;
                    
                    return (
                      <Col xs={24} sm={12} md={8} key={suggestion.mealId}>
                        <Card
                          bodyStyle={{ padding: 12 }}
                          cover={
                            <img
                              alt={meal.nameEnglish}
                              src={meal.imageUrl || "https://via.placeholder.com/200"}
                              className={styles.suggestionImage}
                            />
                          }
                          className={`${styles.suggestionCard} ${
                            isMealSelected(suggestion.mealId) ? styles.selectedSuggestionCard : ""
                          }`}
                          onClick={() => {
                            toggleOrderItem(suggestion.mealId);
                            setShowSuggestions(false);
                          }}
                          hoverable
                        >
                          <div className={styles.suggestionRank}>
                            #{index + 1}
                          </div>
                          <Card.Meta
                            title={
                              <div>
                                <Typography.Text className={styles.suggestionMealTitle}>
                                  {meal.nameEnglish}
                                </Typography.Text>
                                <div className={styles.suggestionScore}>
                                  Match Score: {(suggestion.score * 100).toFixed(0)}%
                                </div>
                                <div className={styles.suggestionPrice}>
                                  Rs. {meal.price ? meal.price.toFixed(2) : "0.00"}
                                </div>
                              </div>
                            }
                            description={
                              <div className={styles.suggestionDescription}>
                                <Typography.Text className={styles.suggestionReason}>
                                  {suggestion.reason}
                                </Typography.Text>
                                <div className={styles.suggestionMetrics}>
                                  <Badge 
                                    count={`Nutrition: ${(suggestion.nutritionalMatch * 100).toFixed(0)}%`} 
                                    style={{ backgroundColor: '#52c41a', fontSize: '10px' }}
                                  />
                                  <Badge 
                                    count={`Preference: ${(suggestion.preferenceMatch * 100).toFixed(0)}%`} 
                                    style={{ backgroundColor: '#1890ff', fontSize: '10px' }}
                                  />
                                  <Badge 
                                    count={`BMI Fit: ${(suggestion.bmiSuitability * 100).toFixed(0)}%`} 
                                    style={{ backgroundColor: '#722ed1', fontSize: '10px' }}
                                  />
                                </div>
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            )}
          </div>
        </Modal>
      </Layout>
    </>
  );
};

export default Page3;
