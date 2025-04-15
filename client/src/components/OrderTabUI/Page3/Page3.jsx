import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Button,Card,Tabs,Badge,Row,Col,Typography,Layout,Alert,} from "antd";
import {LeftOutlined,FilterOutlined,PlusOutlined,CheckCircleOutlined,} from "@ant-design/icons";
import { motion } from "framer-motion";
import styles from "./Page3.module.css";
import DateAndTime from "../DateAndTime/DateAndTime";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Sample translations object
const translations = {
    english: {
        orderSuccess: "Your order has been placed successfully!",
        title: "Order Your Meal",
        back: "Change Language", // Corrected spelling
        today: "Today",
        tomorrow: "Tomorrow",
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        filter: "Suggestions from AI",
        yourOrder: "Your Order",
        noMealsSelected: "No meals selected.",
        placeOrder: "Place Order",
        add: "Add",
    },
    sinhala: {
        orderSuccess: "ඔබේ ඇණවුම සාර්ථකව ඉදිරිපත් කර ඇත!",
        title: "ඔබේ ආහාරය ඇණවුම් කරන්න",
        back: "භාෂාව වෙනස් කරන්න", // Sinhala translation
        today: "අද",
        tomorrow: "හෙට",
        breakfast: "උදේ ආහාරය",
        lunch: "දවල් ආහාරය",
        dinner: "රාත්‍රී ආහාරය",
        filter: "AI නිර්දේශ",
        yourOrder: "ඔබේ ඇණවුම",
        noMealsSelected: "ආහාරයක් තෝරාගෙන නැත.",
        placeOrder: "ඇණවුම ඉදිරිපත් කරන්න",
        add: "එකතු කරන්න",
    },
    tamil: {
        orderSuccess: "உங்கள் ஆர்டர் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!",
        title: "உங்கள் உணவை ஆர்டர் செய்யவும்",
        back: "மொழியை மாற்றவும்", // Tamil translation
        today: "இன்று",
        tomorrow: "நாளை",
        breakfast: "காலை உணவு",
        lunch: "மதிய உணவு",
        dinner: "இரவு உணவு",
        filter: "AI பரிந்துரைகள்",
        yourOrder: "உங்கள் ஆர்டர்",
        noMealsSelected: "உணவுகள் தேர்ந்தெடுக்கப்படவில்லை.",
        placeOrder: "ஆர்டர் செய்யவும்",
        add: "சேர்க்கவும்",
    },
};

import otb3Image from "../../../assets/otb3.jpg";

const meals = [
    {
        id: 1,
        name: "Pancakes",
        description: "Delicious fluffy pancakes.",
        category: "breakfast",
        image: otb3Image,
        price: 5.99,
    },
    {
        id: 2,
        name: "Burger",
        description: "Juicy beef burger with cheese.",
        category: "lunch",
        image: otb3Image,
        price: 8.99,
    },
    {
        id: 3,
        name: "Steak",
        description: "Grilled steak with vegetables.",
        category: "dinner",
        image: otb3Image,
        price: 14.99,
    },
    {
        id: 4,
        name: "Omelette",
        description: "Cheese and mushroom omelette.",
        category: "breakfast",
        image: otb3Image,
        price: 6.49,
    },
    {
        id: 5,
        name: "Caesar Salad",
        description: "Fresh Caesar salad with croutons.",
        category: "lunch",
        image: otb3Image,
        price: 7.99,
    },
    {
        id: 6,
        name: "Spaghetti Bolognese",
        description: "Classic Italian pasta with meat sauce.",
        category: "dinner",
        image: otb3Image,
        price: 12.99,
    },
    {
        id: 7,
        name: "French Toast",
        description: "Golden-brown French toast with syrup.",
        category: "breakfast",
        image: otb3Image,
        price: 5.49,
    },
    {
        id: 8,
        name: "Grilled Chicken Sandwich",
        description: "Grilled chicken sandwich with lettuce and tomato.",
        category: "lunch",
        image: otb3Image,
        price: 9.49,
    },
    {
        id: 9,
        name: "Salmon Fillet",
        description: "Pan-seared salmon with lemon butter sauce.",
        category: "dinner",
        image: otb3Image,
        price: 16.99,
    },
    {
        id: 10,
        name: "Avocado Toast",
        description: "Toasted bread topped with smashed avocado.",
        category: "breakfast",
        image: otb3Image,
        price: 4.99,
    },
    {
        id: 11,
        name: "Chicken Caesar Wrap",
        description: "Grilled chicken Caesar salad in a wrap.",
        category: "lunch",
        image: otb3Image,
        price: 8.49,
    },
    {
        id: 12,
        name: "Beef Stroganoff",
        description: "Creamy beef stroganoff with mushrooms.",
        category: "dinner",
        image: otb3Image,
        price: 13.99,
    },
    {
        id: 13,
        name: "Smoothie Bowl",
        description: "Healthy smoothie bowl with fresh fruits.",
        category: "breakfast",
        image: otb3Image,
        price: 6.99,
    },
    {
        id: 14,
        name: "Veggie Burger",
        description: "Plant-based burger with fresh vegetables.",
        category: "lunch",
        image: otb3Image,
        price: 7.49,
    },
    {
        id: 15,
        name: "Roast Chicken",
        description: "Oven-roasted chicken with herbs.",
        category: "dinner",
        image: otb3Image,
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
        if (date !== "today") return true; // No restrictions for "tomorrow"

        const currentHour = currentTime.getHours();

        if (mealTime === "breakfast") {
            return currentHour < 10; // Breakfast ends at 10 am
        } else if (mealTime === "lunch") {
            return  currentHour < 15; // Lunch ends at 3 pm
        } else if (mealTime === "dinner") {
            return  currentHour < 22; // Dinner ends at 10 pm
        }

        return false; // Default to unavailable
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
            setOrderItems([]); // Clear order items
            window.location.reload(); // Refresh the entire web page
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
                    <div>{username}</div>
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
                                    tabBarStyle={{ fontWeight: "bold" }}
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
                                                        .map((meal) => {
                                                            const isAvailable = isMealTimeAvailable(mealTime, selectedDate);
                                                            return (
                                                                <Col
                                                                    span={8}
                                                                    key={meal.id}
                                                                    className={styles.tabContent}
                                                                    style={{
                                                                        opacity: isAvailable ? 1 : 0.5, // Grayed-out style
                                                                        pointerEvents: isAvailable ? "auto" : "none", // Disable interaction
                                                                    }}
                                                                >
                                                                    <Card
                                                                        onClick={() => isAvailable && addToOrder(meal.id)}
                                                                        cover={
                                                                            <img
                                                                                alt={meal.name}
                                                                                src={meal.image}
                                                                                style={{
                                                                                    height: 200,
                                                                                    objectFit: "cover",
                                                                                    border: "1px solid rgb(0, 0, 0)",
                                                                                    borderRadius: 4,
                                                                                }}
                                                                            />
                                                                        }
                                                                    >
                                                                        <Card.Meta
                                                                            title={meal.name}
                                                                            description={
                                                                                <>
                                                                                    <Text ellipsis>{meal.description}</Text>
                                                                                    <div style={{ marginTop: 8 }}>
                                                                                        <Text strong>${meal.price.toFixed(2)}</Text>
                                                                                    </div>
                                                                                    <Button
                                                                                        type="primary"
                                                                                        block
                                                                                        icon={<PlusOutlined />}
                                                                                        style={{ marginTop: 8 }}
                                                                                        disabled={!isAvailable} // Disable button if unavailable
                                                                                    >
                                                                                        {text.add}
                                                                                    </Button>
                                                                                </>
                                                                            }
                                                                        />
                                                                    </Card>
                                                                </Col>
                                                            );
                                                        })}
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
                                        style={{ marginTop: 5, height: 70 }}
                                    >
                                        {text.placeOrder}
                                    </Button>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginTop: 16,
                                        }}
                                    >
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
                                            onClick={() => {window.location.reload(); }}
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