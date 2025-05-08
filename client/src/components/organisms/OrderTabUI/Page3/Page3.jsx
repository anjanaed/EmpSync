import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Tabs, Badge, Row, Col, Typography, Layout, Alert, Space } from "antd";
import { LeftOutlined, FilterOutlined, PlusOutlined, CheckCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import styles from "./Page3.module.css";
import DateAndTime from "../DateAndTime/DateAndTime";
import translations from "../../../../utils/translations";

const { Content } = Layout;
const { Title, Text } = Typography;

const Page3 = ({ language = "english", username, userId }) => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState("today");
    const [selectedMealTime, setSelectedMealTime] = useState("breakfast");
    const [orderItems, setOrderItems] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false); // New state for error card
    const [meals, setMeals] = useState([]);
    const [allMeals, setAllMeals] = useState([]);
    const text = translations[language];

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

    useEffect(() => {
        const clearLocalStorageOnRefresh = () => {
            localStorage.clear(); // Clear all localStorage items
        };

        window.addEventListener("beforeunload", clearLocalStorageOnRefresh);

        return () => {
            window.removeEventListener("beforeunload", clearLocalStorageOnRefresh);
        };
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
        setOrderItems((prev) => [...prev, { mealId, date, mealTime: selectedMealTime, count: 1 }]);
    };
    const addToOrder2 = (mealId, date, mealTime = selectedMealTime) => {
        setOrderItems((prev) => [
            ...prev,
            { mealId, date, mealTime, count: 1 },
        ]);
    };

    const removeFromOrder = (mealId, date, mealTime = selectedMealTime) => {
        setOrderItems((prev) => {
            const index = prev.findIndex(
                (item) => item.mealId === mealId && item.date === date && item.mealTime === mealTime
            );

            if (index === -1) {
                return prev; // If the item is not found, return the previous state
            }

            const updatedItems = [...prev];
            if (updatedItems[index].count > 1) {
                updatedItems[index] = { ...updatedItems[index], count: updatedItems[index].count - 1 }; // Decrease count
            } else {
                updatedItems.splice(index, 1); // Remove the item if count is 1
            }

            return updatedItems;
        });
    };

    const disappearFromOrder = (mealId, date, mealTime = selectedMealTime) => {
        setOrderItems((prev) =>
            prev.filter((item) => !(item.mealId === mealId && item.date === date && item.mealTime === mealTime))
        );
    };

    const placeOrder = async () => {
        // Group order items by date and meal time
        const groupedOrders = orderItems.reduce((acc, item) => {
            const key = `${item.date}-${item.mealTime}`;
            if (!acc[key]) {
                acc[key] = { date: item.date, mealTime: item.mealTime, meals: {}, totalPrice: 0 };
            }
            // Increment the count for the mealId
            acc[key].meals[item.mealId] = (acc[key].meals[item.mealId] || 0) + item.count;

            // Calculate the total price
            const meal = allMeals.find((meal) => meal.id === item.mealId);
            acc[key].totalPrice += meal ? meal.price * item.count : 0;

            return acc;
        }, {});

        // Prepare and send each order to the backend
        try {
            for (const key in groupedOrders) {
                const { date, mealTime, meals, totalPrice } = groupedOrders[key];

                // Convert meals object to the desired format (e.g., "010:2,011:1")
                const mealsArray = Object.entries(meals).map(([mealId, count]) => `${mealId}:${count}`);

                // Format the orderDate using the current system date and time
                const now = new Date();
                const orderDate =
                    date === "today"
                        ? now.toISOString() // Use the current system date and time
                        : new Date(now.setDate(now.getDate() + 1)).toISOString(); // Use the next day's date and time

                const orderData = {
                    employeeId: userId,
                    meals: mealsArray, // Pass the meals as an array of strings
                    orderDate, // Use the formatted ISO-8601 DateTime
                    breakfast: mealTime === "breakfast",
                    lunch: mealTime === "lunch",
                    dinner: mealTime === "dinner",
                    price: totalPrice,
                    serve: false,
                };

                // Log the orderData and current date/time for debugging
                console.log("Sending orderData to backend:", orderData);
                console.log("Order placed at:", now.toISOString());

                // Send the order to the backend
                const response = await fetch("http://localhost:3000/orders", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(orderData),
                });

                // Check if the response is successful
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error from backend:", errorData);
                    const errorMessage = `Failed to place order: ${response.statusText}`;
                    console.error(errorMessage);
                    setShowError(true);
                    setTimeout(() => {
                        setShowError(false);
                    }, 3000);
                    throw new Error(errorMessage);
                }
            }

            // Show success message and reset state
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


    return (
        <Layout className={styles.layout}>
            <div className={styles.header}>
                <div className={styles.DateAndTime}>
                    <DateAndTime />
                </div>
                <div className={styles.userName}>
                    <div>{username || "Guest"}</div> {/* Display "Guest" if username is empty */}
                </div>
            </div>

            <Content style={{ padding: 24, position: "relative" }}>
                {showSuccess ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.successContainer} // Use a class instead of inline styles
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
                        className={styles.errorContainer} // Use a class instead of inline styles
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
                                    <Space.Compact className={styles.dateButtonGroup}>
                                        <Button
                                            type="default"
                                            onClick={() => setSelectedDate("today")}
                                            className={`${styles.dateButton} ${selectedDate === "today" ? styles.selectedDateButton : ""}`}
                                        >
                                            {text.today} ({formatDateForDisplay(currentTime)})
                                        </Button>
                                        <Button
                                            type="default"
                                            onClick={() => setSelectedDate("tomorrow")}
                                            className={`${styles.dateButton} ${selectedDate === "tomorrow" ? styles.selectedDateButton : ""}`}
                                        >
                                            {text.tomorrow} ({formatDateForDisplay(getTomorrowDate())})
                                        </Button>
                                    </Space.Compact>
                                </div>

                                <Tabs
                                    activeKey={selectedMealTime}
                                    onChange={setSelectedMealTime}
                                    tabBarStyle={{ fontWeight: "bold" }} // Keep this inline as Ant Design Tabs doesn't support external styles for this
                                    tabBarExtraContent={
                                        <Button
                                            type="default"
                                            icon={<FilterOutlined />}
                                            onClick={() => console.log("Filter button clicked")}
                                            className={styles.filterButton} // Use a class instead of inline styles
                                        >
                                            {text.filter}
                                        </Button>
                                    }
                                    items={["breakfast", "lunch", "dinner"].map((mealTime) => ({
                                        key: mealTime,
                                        label: (
                                            <span
                                                className={`${styles.tabLabel} ${!isMealTimeAvailable(mealTime, selectedDate)
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
                                                <Row gutter={16}>
                                                    {meals.map((meal) => {
                                                        const isPastDue = (() => {
                                                            if (selectedDate === "tomorrow") return false;
                                                            const currentHour = currentTime.getHours();
                                                            if (selectedMealTime === "breakfast" && currentHour >= 10) return true;
                                                            if (selectedMealTime === "lunch" && currentHour >= 15) return true;
                                                            if (selectedMealTime === "dinner" && currentHour >= 22) return true;
                                                            return false;
                                                        })();

                                                        return (
                                                            <Col span={8} key={meal.id} className={styles.tabContent}>
                                                                <Card
                                                                    onClick={() => !isPastDue && addToOrder(meal.id)}
                                                                    cover={
                                                                        <img
                                                                            alt={meal[`name${language.charAt(0).toUpperCase() + language.slice(1)}`] || "Meal"}
                                                                            src={meal.imageUrl || "https://via.placeholder.com/200"}
                                                                            className={`${styles.mealImage} ${isPastDue ? styles.pastDueImage : ""}`}
                                                                        />
                                                                    }
                                                                    className={`${styles.mealCard} ${isPastDue ? styles.pastDueCard : ""}`}
                                                                >
                                                                    <Card.Meta
                                                                        title={meal[`name${language.charAt(0).toUpperCase() + language.slice(1)}`] || "Unnamed Meal"}
                                                                        description={
                                                                            <>
                                                                                <Text ellipsis>{meal.description || "No description available"}</Text>
                                                                                <div className={styles.priceContainer}>
                                                                                    <Text strong>${meal.price ? meal.price.toFixed(2) : "0.00"}</Text>
                                                                                </div>
                                                                                <Button
                                                                                    type="primary"
                                                                                    block
                                                                                    icon={<PlusOutlined />}
                                                                                    className={`${styles.addButton} ${isPastDue ? styles.disabledButton : ""}`}
                                                                                    disabled={isPastDue}
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
                                        <Card title={<Title level={4}>{text.yourOrder}</Title>}>
                                            {orderItems.length === 0 ? (
                                                <Alert message={text.noMealsSelected} type="info" showIcon />
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
                                                        const meal = allMeals.find((meal) => meal.id === item.mealId);
                                                        return (
                                                            <Col span={24} key={index}>
                                                                <div className={styles.orderCard}>
                                                                    <Row gutter={[16, 16]}>
                                                                        {/* First Row */}
                                                                        <Col span={10} style={{ textAlign: "left" }}>
                                                                            <Text strong style={{ fontSize: 15 }}>
                                                                                {meal
                                                                                    ? meal[`name${language.charAt(0).toUpperCase() + language.slice(1)}`] || "Unnamed Meal"
                                                                                    : "Meal not found"}
                                                                            </Text>
                                                                        </Col>
                                                                        <Col span={10} style={{ textAlign: "right" }}>
                                                                            <Text strong >
                                                                                ${meal ? (meal.price * item.count).toFixed(2) : "0.00"}
                                                                            </Text>
                                                                        </Col>
                                                                        <Col span={4} style={{ textAlign: "right" }}>
                                                                            <Button
                                                                                className={styles.removeButton}
                                                                                type="text"
                                                                                icon={<CloseOutlined />}
                                                                                onClick={() => disappearFromOrder(orderItems[index].mealId, orderItems[index].date, orderItems[index].mealTime)}
                                                                            />
                                                                        </Col>
                                                                    </Row>
                                                                    <Row gutter={[16, 16]} className={styles.secondRow}>
                                                                        {/* Second Row */}
                                                                        <Col span={12}>
                                                                            <Badge
                                                                                status="processing"
                                                                                text={item.date === "today" ? text.today : text.tomorrow}
                                                                            />
                                                                            <Badge
                                                                                status="success"
                                                                                text={text[item.mealTime]}
                                                                                className={styles.mealTimeBadge}
                                                                            />
                                                                        </Col>
                                                                        <Col span={12} className={styles.rightAligned}>
                                                                            <Button
                                                                                type="text"
                                                                                onClick={() => removeFromOrder(meal.id, item.date, item.mealTime)}
                                                                                className={styles.actionButton}
                                                                            >
                                                                                -
                                                                            </Button>
                                                                            <Badge
                                                                                status="default"
                                                                                text={`${item.count}`}
                                                                                className={styles.itemCountBadge}
                                                                            />
                                                                            <Button
                                                                                type="text"
                                                                                onClick={() => addToOrder2(meal.id, item.date, item.mealTime)}
                                                                                className={styles.actionButton}
                                                                            >
                                                                                +
                                                                            </Button>
                                                                        </Col>
                                                                    </Row>
                                                                    <hr />
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
                                        className={`${styles.placeOrderButton} ${orderItems.length === 0 ? styles.disabledButton : styles.enabledButton}`}
                                    >
                                        {text.placeOrder}
                                    </Button>
                                    <div className={styles.totalContainer}>
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
                                            onClick={() => {
                                                window.location.reload();
                                            }}
                                            className={styles.backButton}
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