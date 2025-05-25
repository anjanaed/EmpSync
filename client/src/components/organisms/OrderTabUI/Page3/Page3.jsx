import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Tabs,
  Badge,
  Row,
  Col,
  Tooltip,
  Typography,
  Layout,
  Alert,
  Space,
} from "antd";
import {
  LeftOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { MdLanguage } from "react-icons/md";
import { RiAiGenerate } from "react-icons/ri";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import styles from "./Page3.module.css";
import DateAndTime from "../DateAndTime/DateAndTime";
import translations from "../../../../utils/translations";

const { Content } = Layout;
const { Title, Text } = Typography;

const Page3 = ({ language = "english", username, userId, carouselRef }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("today");
  const [selectedMealTime, setSelectedMealTime] = useState("breakfast");
  const [orderItems, setOrderItems] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [meals, setMeals] = useState([]);
  const [allMeals, setAllMeals] = useState([]);
  const text = translations[language];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const determineMealTime = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 10) return "breakfast";
      else if (currentHour < 15) return "lunch";
      else if (currentHour < 22) return "dinner";
      else return "breakfast";
    };

    setSelectedMealTime(determineMealTime());
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const date =
          selectedDate === "today"
            ? new Date()
            : new Date(new Date().setDate(new Date().getDate() + 1));
        const formattedDate = date.toISOString().split("T")[0];
        const scheduleResponse = await fetch(
          `http://localhost:3000/schedule/${formattedDate}`
        );

        if (!scheduleResponse.ok) {
          throw new Error("Failed to fetch schedule");
        }

        const scheduleData = await scheduleResponse.json();
        const mealIds = scheduleData[selectedMealTime] || [];

        const mealDetailsPromises = mealIds.map((id) =>
          fetch(`http://localhost:3000/meal/${id}`).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch meal with ID: ${id}`);
            return res.json();
          })
        );

        const mealDetails = await Promise.all(mealDetailsPromises);
        setMeals(mealDetails);

        setAllMeals((prevAllMeals) => {
          const newMeals = mealDetails.filter(
            (meal) => !prevAllMeals.some((m) => m.id === meal.id)
          );
          return [...prevAllMeals, ...newMeals];
        });
      } catch (error) {
        console.error("Error fetching meals:", error);
        setMeals([]);
      }
    };

    fetchMeals();
  }, [selectedDate, selectedMealTime]);

  useEffect(() => {
    const clearLocalStorageOnRefresh = () => {
      localStorage.clear();
    };

    window.addEventListener("beforeunload", clearLocalStorageOnRefresh);
    return () =>
      window.removeEventListener("beforeunload", clearLocalStorageOnRefresh);
  }, []);

  const formatDateForDisplay = (date) => date.toLocaleDateString();

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const isMealTimeAvailable = (mealTime, date) => {
    if (date !== "today") return true;
    const currentHour = currentTime.getHours();
    if (mealTime === "breakfast") return currentHour < 10;
    if (mealTime === "lunch") return currentHour < 15;
    if (mealTime === "dinner") return currentHour < 22;
    return false;
  };

  const addToOrder = (mealId, date = selectedDate) => {
    setOrderItems((prev) => {
      const exists = prev.some(
        (item) =>
          item.mealId === mealId &&
          item.mealTime === selectedMealTime &&
          item.date === date
      );
      if (exists) {
        return prev.filter(
          (item) =>
            !(
              item.mealId === mealId &&
              item.mealTime === selectedMealTime &&
              item.date === date
            )
        );
      } else {
        return [
          ...prev,
          { mealId, date, mealTime: selectedMealTime, count: 1 },
        ];
      }
    });
  };

  const addToOrder2 = (mealId, date, mealTime = selectedMealTime) => {
    setOrderItems((prev) => [...prev, { mealId, date, mealTime, count: 1 }]);
  };

  const removeFromOrder = (mealId, date, mealTime = selectedMealTime) => {
    setOrderItems((prev) => {
      const index = prev.findIndex(
        (item) =>
          item.mealId === mealId &&
          item.date === date &&
          item.mealTime === mealTime
      );

      if (index === -1) return prev;

      const updatedItems = [...prev];
      if (updatedItems[index].count > 1) {
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

  const disappearFromOrder = (mealId, date, mealTime = selectedMealTime) => {
    setOrderItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.mealId === mealId &&
            item.date === date &&
            item.mealTime === mealTime
          )
      )
    );
  };

  const placeOrder = async () => {
    const groupedOrders = orderItems.reduce((acc, item) => {
      const key = `${item.date}-${item.mealTime}`;
      if (!acc[key]) {
        acc[key] = {
          date: item.date,
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
        const now = new Date();
        const orderDate =
          date === "today"
            ? now.toISOString()
            : new Date(now.setDate(now.getDate() + 1)).toISOString();

        const orderData = {
          employeeId: userId,
          meals: mealsArray,
          orderDate,
          breakfast: mealTime === "breakfast",
          lunch: mealTime === "lunch",
          dinner: mealTime === "dinner",
          price: totalPrice,
          serve: false,
        };

        console.log("Sending orderData to backend:", orderData);
        console.log("Order placed at:", now.toISOString());

        const response = await fetch("http://localhost:3000/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error from backend:", errorData);
          const errorMessage = `Failed to place order: ${response.statusText}`;
          console.error(errorMessage);
          setShowError(true);
          setTimeout(() => setShowError(false), 3000);
          throw new Error(errorMessage);
        }
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setOrderItems([]);
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error placing orders:", error);
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        window.location.reload();
      }, 3000);
    }
  };

  const isMealSelected = (mealId) =>
    orderItems.some(
      (item) =>
        item.mealId === mealId &&
        item.mealTime === selectedMealTime &&
        item.date === selectedDate
    );

  return (
    <Layout className={styles.layout}>
      <div className={styles.header}>
        <div className={styles.name}>B i z &nbsp; S o l u t i o n</div>
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
                      {text.tomorrow} ({formatDateForDisplay(getTomorrowDate())}
                      )
                    </Button>
                  </Space.Compact>
                </div>
                <Tabs
                  activeKey={selectedMealTime}
                  onChange={setSelectedMealTime}
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
                  items={["breakfast", "lunch", "dinner"].map((mealTime) => ({
                    key: mealTime,
                    label: (
                      <span
                        className={`${styles.tabLabel} ${
                          !isMealTimeAvailable(mealTime, selectedDate)
                            ? styles.unavailableTab
                            : selectedMealTime === mealTime
                            ? styles.selectedTab
                            : ""
                        }`}
                      >
                        {text[mealTime]}
                      </span>
                    ),
                    disabled: !isMealTimeAvailable(mealTime, selectedDate),
                    children: (
                      <div className={styles.mealList}>
                        <Row gutter={8}>
                          {meals.map((meal) => {
                            const isPastDue = (() => {
                              if (selectedDate === "tomorrow") return false;
                              const currentHour = currentTime.getHours();
                              if (
                                selectedMealTime === "breakfast" &&
                                currentHour >= 10
                              )
                                return true;
                              if (
                                selectedMealTime === "lunch" &&
                                currentHour >= 15
                              )
                                return true;
                              if (
                                selectedMealTime === "dinner" &&
                                currentHour >= 22
                              )
                                return true;
                              return false;
                            })();

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
                                            language.charAt(0).toUpperCase() +
                                            language.slice(1)
                                          }`
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
                                  className={`
                                    ${styles.mealCard}
                                    ${isPastDue ? styles.pastDueCard : ""}
                                    ${
                                      isMealSelected(meal.id)
                                        ? styles.selectedMealCard
                                        : ""
                                    }
                                  `}
                                  onClick={() =>
                                    !isPastDue && addToOrder(meal.id)
                                  }
                                  hoverable
                                >
                                  <hr className={styles.mealCardhr} />
                                  <Card.Meta
                                    title={
                                      <div>
                                        <Text className={styles.mealTitle}>
                                          {meal[
                                            `name${
                                              language.charAt(0).toUpperCase() +
                                              language.slice(1)
                                            }`
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
                                            Rs.
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
                      </div>
                    ),
                  }))}
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
                              if (!acc[key]) {
                                acc[key] = { ...item, count: 0 };
                              }
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
                                        icon={<IoClose size={20} color="red" />}
                                        onClick={() =>
                                          disappearFromOrder(
                                            orderItems[index].mealId,
                                            orderItems[index].date,
                                            orderItems[index].mealTime
                                          )
                                        }
                                      />
                                    </Col>
                                  </Row>
                                  <Row
                                    gutter={[16, 16]}
                                    className={styles.secondRow}
                                  >
                                    <Col className={styles.orderInfo} span={12}>
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
                                        text={text[item.mealTime]}
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
                                            removeFromOrder(
                                              meal.id,
                                              item.date,
                                              item.mealTime
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
                                            addToOrder2(
                                              meal.id,
                                              item.date,
                                              item.mealTime
                                            )
                                          }
                                          className={styles.actionButton}
                                        >
                                          +
                                        </Button>
                                      </div>
                                      <div className={styles.priceDiv}>
                                        <Text strong>
                                          Rs.
                                          {meal
                                            ? (meal.price * item.count).toFixed(
                                                2
                                              )
                                            : "0.00"}
                                        </Text>
                                      </div>
                                    </Col>
                                  </Row>
                                  <hr style={{ margin: "20px 0px 5px 0px" }} />
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
                      Total: Rs.
                      {orderItems
                        .reduce((total, item) => {
                          const meal = allMeals.find(
                            (meal) => meal.id === item.mealId
                          );
                          return total + (meal ? meal.price : 0);
                        }, 0)
                        .toFixed(2)}
                    </Text>
                    <Button
                      onClick={() => {
                        carouselRef.current.goTo(0);
                      }}
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
  );
};

export default Page3;
