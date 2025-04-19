import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Tabs, Badge, Row, Col, Typography, Layout, Alert, Space } from "antd";
import { LeftOutlined, FilterOutlined, PlusOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import styles from "./Page3.module.css";
import DateAndTime from "../DateAndTime/DateAndTime";

const { Content } = Layout;
const { Title, Text } = Typography;

const translations = {
    english: {
        orderSuccess: "Your order has been placed successfully!",
        title: "Order Your Meal",
        back: "Change Language",
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
        back: "භාෂාව වෙනස් කරන්න",
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
        back: "மொழியை மாற்றவும்",
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

const Page3 = ({ carouselRef, language = "english" }) => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [username, setUsername] = useState("Hashan Rajakaruna");
    const [selectedDate, setSelectedDate] = useState("today");
    const [selectedMealTime, setSelectedMealTime] = useState("breakfast");
    const [orderItems, setOrderItems] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [meals, setMeals] = useState([]);
    const [allMeals, setAllMeals] = useState([]); // New state to store all meals

    useEffect(() => {
        // Set the current time
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Determine the initial meal time based on the current time
        const determineMealTime = () => {
            const currentHour = new Date().getHours();
            if (currentHour < 10) {
                return "breakfast"; // Before 10 AM
            } else if (currentHour < 15) {
                return "lunch"; // Before 3 PM
            } else if (currentHour < 22) {
                return "dinner"; // Before 10 PM
            } else {
                return "breakfast"; // Default to breakfast for late-night hours
            }
        };

        // Set the initial meal time
        setSelectedMealTime(determineMealTime());

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const date = selectedDate === "today" ? new Date() : new Date(new Date().setDate(new Date().getDate() + 1));
                const formattedDate = date.toISOString().split("T")[0];
                const scheduleResponse = await fetch(`http://localhost:3000/schedule/${formattedDate}`);
                
                if (!scheduleResponse.ok) {
                    throw new Error("Failed to fetch schedule");
                }

                const scheduleData = await scheduleResponse.json();
                const mealIds = scheduleData[selectedMealTime] || [];

                // Fetch meal details for the meal IDs
                const mealDetailsPromises = mealIds.map((id) =>
                    fetch(`http://localhost:3000/meal/${id}`).then((res) => {
                        if (!res.ok) {
                            throw new Error(`Failed to fetch meal with ID: ${id}`);
                        }
                        return res.json();
                    })
                );

                const mealDetails = await Promise.all(mealDetailsPromises);
                setMeals(mealDetails);

                // Merge new meals into allMeals
                setAllMeals((prevAllMeals) => {
                    const newMeals = mealDetails.filter((meal) => !prevAllMeals.some((m) => m.id === meal.id));
                    return [...prevAllMeals, ...newMeals];
                });
            } catch (error) {
                console.error("Error fetching meals:", error);
                setMeals([]);
            }
        };

        fetchMeals();
    }, [selectedDate, selectedMealTime]);

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

    const addToOrder = (mealId) => {
        setOrderItems((prev) => [...prev, { mealId, date: selectedDate, mealTime: selectedMealTime }]);
    };

    const removeFromOrder = (index) => {
        setOrderItems((prev) => prev.filter((_, i) => i !== index));
    };

    const placeOrder = () => {
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            setOrderItems([]);
            window.location.reload();
        }, 3000);
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
                                    tabBarStyle={{
                                        fontWeight: "bold", // Make the font bold
                                    }}
                                    items={["breakfast", "lunch", "dinner"].map((mealTime) => ({
                                        key: mealTime,
                                        label: text[mealTime],
                                        disabled: !isMealTimeAvailable(mealTime, selectedDate),
                                        children: (
                                            <div className={styles.mealList}>
                                                <Row gutter={16}>
                                                    {meals.map((meal) => {
                                                        // Determine if the meal is past its due time
                                                        const isPastDue = (() => {
                                                            if (selectedDate === "tomorrow") return false; // Always allow meals for tomorrow
                                                            const currentHour = currentTime.getHours();
                                                            if (selectedMealTime === "breakfast" && currentHour >= 10) return true;
                                                            if (selectedMealTime === "lunch" && currentHour >= 15) return true;
                                                            if (selectedMealTime === "dinner" && currentHour >= 22) return true;
                                                            return false;
                                                        })();

                                                        return (
                                                            <Col span={8} key={meal.id} className={styles.tabContent}>
                                                                <Card
                                                                    onClick={() => !isPastDue && addToOrder(meal.id)} // Disable click if past due
                                                                    cover={
                                                                        <img
                                                                            alt={meal[`name${language.charAt(0).toUpperCase() + language.slice(1)}`] || "Meal"}
                                                                            src={meal.imageUrl || "https://via.placeholder.com/200"}
                                                                            style={{
                                                                                height: 200,
                                                                                objectFit: "cover",
                                                                                border: "1px solid rgb(0, 0, 0)",
                                                                                borderRadius: 4,
                                                                                filter: isPastDue ? "grayscale(100%)" : "none", // Gray out the image if past due
                                                                            }}
                                                                        />
                                                                    }
                                                                    style={{
                                                                        cursor: isPastDue ? "not-allowed" : "pointer", // Change cursor if past due
                                                                        opacity: isPastDue ? 0.5 : 1, // Reduce opacity if past due
                                                                    }}
                                                                >
                                                                    <Card.Meta
                                                                        title={meal[`name${language.charAt(0).toUpperCase() + language.slice(1)}`] || "Unnamed Meal"}
                                                                        description={
                                                                            <>
                                                                                <Text ellipsis>{meal.description || "No description available"}</Text>
                                                                                <div style={{ marginTop: 8 }}>
                                                                                    <Text strong>
                                                                                        ${meal.price ? meal.price.toFixed(2) : "0.00"}
                                                                                    </Text>
                                                                                </div>
                                                                                <Button
                                                                                    type="primary"
                                                                                    block
                                                                                    icon={<PlusOutlined />}
                                                                                    style={{ marginTop: 8 }}
                                                                                    disabled={isPastDue} // Disable button if past due
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
                                        ),
                                    }))}
                                />
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
                                                        const meal = allMeals.find((meal) => meal.id === item.mealId); // Use allMeals instead of meals
                                                        return (
                                                            <div key={index} className={styles.orderCard}>
                                                                <div className={styles.orderDetails}>
                                                                    <div>
                                                                        <Text
                                                                            strong
                                                                            style={{
                                                                                marginLeft: 0,
                                                                                fontSize: 20,
                                                                            }}
                                                                        >
                                                                            {meal
                                                                                ? meal[`name${language.charAt(0).toUpperCase() + language.slice(1)}`] || "Unnamed Meal"
                                                                                : "Meal not found"}
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
                                                                                ${meal ? meal.price.toFixed(2) : "0.00"}
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
                                                    const meal = allMeals.find((meal) => meal.id === item.mealId); // Use allMeals instead of meals
                                                    return total + (meal ? meal.price : 0);
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