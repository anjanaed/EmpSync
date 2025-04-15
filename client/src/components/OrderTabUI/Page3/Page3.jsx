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
} from "antd";
import {
  ClockCircleOutlined,
  LeftOutlined,
  FilterOutlined,
  PlusOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import styles from "./Page3.module.css";
import DateAndTime from "../DateAndTime/DateAndTime";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Sample translations object
const translations = {
  english: {
    orderSuccess: "Your order has been placed successfully!",
    title: "Order Your Meal",
    back: "Back",
    today: "Today",
    tomorrow: "Tomorrow",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    filter: "Filter",
    yourOrder: "Your Order",
    noMealsSelected: "No meals selected.",
    placeOrder: "Place Order",
    add: "Add",
  },
};

const meals = [
  {
    id: 1,
    name: "Pancakes",
    description: "Delicious fluffy pancakes.",
    category: "breakfast",
    image: "https://via.placeholder.com/200",
    price: 5.99,
  },
  {
    id: 2,
    name: "Burger",
    description: "Juicy beef burger with cheese.",
    category: "lunch",
    image: "https://via.placeholder.com/200",
    price: 8.99,
  },
  {
    id: 3,
    name: "Steak",
    description: "Grilled steak with vegetables.",
    category: "dinner",
    image: "https://via.placeholder.com/200",
    price: 14.99,
  },
  {
    id: 4,
    name: "Omelette",
    description: "Cheese and mushroom omelette.",
    category: "breakfast",
    image: "https://via.placeholder.com/200",
    price: 6.49,
  },
  {
    id: 5,
    name: "Caesar Salad",
    description: "Fresh Caesar salad with croutons.",
    category: "lunch",
    image: "https://via.placeholder.com/200",
    price: 7.99,
  },
  {
    id: 6,
    name: "Spaghetti Bolognese",
    description: "Classic Italian pasta with meat sauce.",
    category: "dinner",
    image: "https://via.placeholder.com/200",
    price: 12.99,
  },
  {
    id: 7,
    name: "French Toast",
    description: "Golden-brown French toast with syrup.",
    category: "breakfast",
    image: "https://via.placeholder.com/200",
    price: 5.49,
  },
  {
    id: 8,
    name: "Grilled Chicken Sandwich",
    description: "Grilled chicken sandwich with lettuce and tomato.",
    category: "lunch",
    image: "https://via.placeholder.com/200",
    price: 9.49,
  },
  {
    id: 9,
    name: "Salmon Fillet",
    description: "Pan-seared salmon with lemon butter sauce.",
    category: "dinner",
    image: "https://via.placeholder.com/200",
    price: 16.99,
  },
  {
    id: 10,
    name: "Avocado Toast",
    description: "Toasted bread topped with smashed avocado.",
    category: "breakfast",
    image: "https://via.placeholder.com/200",
    price: 4.99,
  },
  {
    id: 11,
    name: "Chicken Caesar Wrap",
    description: "Grilled chicken Caesar salad in a wrap.",
    category: "lunch",
    image: "https://via.placeholder.com/200",
    price: 8.49,
  },
  {
    id: 12,
    name: "Beef Stroganoff",
    description: "Creamy beef stroganoff with mushrooms.",
    category: "dinner",
    image: "https://via.placeholder.com/200",
    price: 13.99,
  },
  {
    id: 13,
    name: "Smoothie Bowl",
    description: "Healthy smoothie bowl with fresh fruits.",
    category: "breakfast",
    image: "https://via.placeholder.com/200",
    price: 6.99,
  },
  {
    id: 14,
    name: "Veggie Burger",
    description: "Plant-based burger with fresh vegetables.",
    category: "lunch",
    image: "https://via.placeholder.com/200",
    price: 7.49,
  },
  {
    id: 15,
    name: "Roast Chicken",
    description: "Oven-roasted chicken with herbs.",
    category: "dinner",
    image: "https://via.placeholder.com/200",
    price: 15.49,
  },
];

const Page3 = ({ carouselRef, language = "english" }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [username, setUsername] = useState("Hashan Rajakaruna");
  const [selectedDate, setSelectedDate] = useState("today");
  const [selectedMealTime, setSelectedMealTime] = useState("breakfast");
  const [orderItems, setOrderItems] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString();
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const isMealTimeAvailable = (mealTime, date) => {
    // Logic to determine if the meal time is available
    return true;
  };

  const addToOrder = (mealId) => {
    setOrderItems((prev) => [
      ...prev,
      { mealId, date: selectedDate, mealTime: selectedMealTime },
    ]);
  };

  const removeFromOrder = (index) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const placeOrder = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setOrderItems([]);
    }, 3000);
  };

  const getMealById = (id) => {
    return meals.find((meal) => meal.id === id);
  };

  const text = translations[language];

return (
    <Layout className={styles.layout}>
        <div className={styles.header}>
            <div className={styles.DateAndTime}>
                <DateAndTime />
            </div>
            <div className={styles.userName}>
                <div>Hashan Rajakaruna</div>
            </div>
        </div>

        <Content style={{ padding: 24, position: "relative" }}>
            {showSuccess ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "80vh",
                    }}
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
            ) : (
                <Card
                    title={
                        <Title level={2} className={styles.cardTitle}>
                            {text.title}
                        </Title>
                    }
                    className={styles.cardContainer}
                >
                    <Row gutter={24}>
                        <Col span={16}>
                            <div style={{ marginBottom: 24 }}>
                                <Button.Group className={styles.dateButtonGroup}>
                                    <Button
                                        type={selectedDate === "today" ? "primary" : "default"}
                                        onClick={() => setSelectedDate("today")}
                                        className={styles.dateButton}
                                    >
                                        {text.today} ({formatDateForDisplay(currentTime)})
                                    </Button>
                                    <Button
                                        type={selectedDate === "tomorrow" ? "primary" : "default"}
                                        onClick={() => setSelectedDate("tomorrow")}
                                        className={styles.dateButton}
                                    >
                                        {text.tomorrow} ({formatDateForDisplay(getTomorrowDate())})
                                    </Button>
                                </Button.Group>
                            </div>

                            <Tabs
                                activeKey={selectedMealTime}
                                onChange={setSelectedMealTime}
                                tabBarExtraContent={
                                    <Button icon={<FilterOutlined />}>{text.filter}</Button>
                                }
                            >
                                {["breakfast", "lunch", "dinner"].map((mealTime) => (
                                    <TabPane
                                        key={mealTime}
                                        tab={text[mealTime]}
                                        disabled={!isMealTimeAvailable(mealTime, selectedDate)}
                                    >
                                        <div className={styles.mealList}>
                                            <Row gutter={16}>
                                                {meals
                                                    .filter((meal) => meal.category === mealTime)
                                                    .map((meal) => (
                                                        <Col
                                                            span={8}
                                                            key={meal.id}
                                                            className={styles.tabContent}
                                                        >
                                                            <Card
                                                                cover={
                                                                    <img
                                                                        alt={meal.name}
                                                                        src={meal.image}
                                                                        style={{
                                                                            height: 200,
                                                                            objectFit: "cover",
                                                                        }}
                                                                    />
                                                                }
                                                            >
                                                                <Card.Meta
                                                                    title={meal.name}
                                                                    description={
                                                                        <>
                                                                            <Text ellipsis>
                                                                                {meal.description}
                                                                            </Text>
                                                                            <div style={{ marginTop: 8 }}>
                                                                                <Text strong>
                                                                                    ${meal.price.toFixed(2)}
                                                                                </Text>
                                                                            </div>
                                                                            <Button
                                                                                type="primary"
                                                                                block
                                                                                icon={<PlusOutlined />}
                                                                                onClick={() => addToOrder(meal.id)}
                                                                                style={{ marginTop: 8 }}
                                                                            >
                                                                                {text.add}
                                                                            </Button>
                                                                        </>
                                                                    }
                                                                />
                                                            </Card>
                                                        </Col>
                                                    ))}
                                            </Row>
                                        </div>
                                    </TabPane>
                                ))}
                            </Tabs>
                        </Col>

                        <Col span={8}>
                            <div className={styles.orderSummaryContainer}>
                                <div className={styles.orderSummary}>
                                    <Card
                                        title={<Title level={4}>{text.yourOrder}</Title>}
                                    >
                                        {orderItems.length === 0 ? (
                                            <Alert
                                                message={text.noMealsSelected}
                                                type="info"
                                                showIcon
                                            />
                                        ) : (
                                            <>
                                                {orderItems.map((item, index) => {
                                                    const meal = getMealById(item.mealId);
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={styles.orderCard}
                                                        >
                                                            <div className={styles.orderDetails}>
                                                                <div>
                                                                    <Text
                                                                        strong
                                                                        style={{
                                                                            marginLeft: 0,
                                                                            fontSize: 20,
                                                                        }}
                                                                    >
                                                                        {meal.name}
                                                                    </Text>
                                                                    <div style={{ marginTop: 8 }}>
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
                                                                            style={{ marginLeft: 8 }}
                                                                        />
                                                                        <Badge
                                                                            status="default"
                                                                            style={{ marginLeft: 8 }}
                                                                        />
                                                                        <Text strong>
                                                                            ${meal.price.toFixed(2)}
                                                                        </Text>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    className={styles.removeButton}
                                                                    type="text"
                                                                    onClick={() => removeFromOrder(index)}
                                                                >
                                                                    X
                                                                </Button>
                                                            </div>
                                                            <hr />
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </Card>
                                </div>
                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    onClick={placeOrder}
                                    disabled={orderItems.length === 0}
                                    style={{ marginTop: 5,height: 70 }}
                                >
                                    {text.placeOrder}
                                </Button>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                                    <Text strong>
                                        Total: $
                                        {orderItems
                                            .reduce((total, item) => {
                                                const meal = getMealById(item.mealId);
                                                return total + meal.price;
                                            }, 0)
                                            .toFixed(2)}
                                    </Text>
                                    <Button
                                        icon={<LeftOutlined />}
                                        onClick={() => navigate("/auth")}
                                    >
                                        {text.back}
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