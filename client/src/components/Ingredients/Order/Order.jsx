import React, { useState, useEffect } from "react";
import { Card, Typography, Tag, Spin } from "antd";
import styles from "./Order.module.css";

const { Title } = Typography;

const Order = () => {
    const [ingredients, setIngredients] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const response = await fetch("http://localhost:3000/ingredients/optimized");
            const data = await response.json();
            setIngredients(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching ingredients:", error);
            setLoading(false);
        }
    };

    const IngredientCard = ({ item }) => (
        <Card className={styles.card}>
            <Title level={4}>{item.name}</Title>
            <p>Type: {item.type}</p>
            <p>Price per unit: ${item.price_per_unit}</p>
            <p>Quantity: {item.quantity}</p>
            <Tag color={item.priority === 1 ? "red" : item.priority === 2 ? "orange" : "blue"}>
                Priority {item.priority}
            </Tag>
        </Card>
    );

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div className={styles.orderContainer}>
            <Title level={2} className={styles.sectionTitle}>Priority Ingredients</Title>
            <div className={styles.cardGrid}>
                {ingredients?.priority1Ingredients.map((item) => (
                    <IngredientCard key={item.id} item={item} />
                ))}
            </div>

            <Title level={2} className={styles.sectionTitle}>Optimized Ingredients</Title>
            <div className={styles.cardGrid}>
                {ingredients?.optimizedIngredients.map((item) => (
                    <IngredientCard key={item.id} item={item} />
                ))}
            </div>

            <p className={styles.lastUpdated}>
                Last updated: {new Date(ingredients?.lastUpdated).toLocaleString()}
            </p>
        </div>
    );
};

export default Order;