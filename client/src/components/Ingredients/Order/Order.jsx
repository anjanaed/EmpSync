import React, { useState, useEffect } from "react";
import { Typography, Tag, Spin, Button, Table } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./Order.module.css";

const { Title } = Typography;

const Order = () => {
    const [ingredients, setIngredients] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Price (Rs.)',
            dataIndex: 'price_per_unit',
            key: 'price',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => (
                <Tag color={priority === 1 ? "red" : priority === 2 ? "orange" : "blue"}>
                    Priority {priority}
                </Tag>
            ),
        },
    ];

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

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div className={styles.orderContainer}>
            <Title level={2} className={styles.sectionTitle}>Priority Ingredients</Title>
            <Table 
                dataSource={ingredients?.priority1Ingredients}
                columns={columns}
                className={styles.table}
                pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                }}
                rowKey="id"
            />

            <Title level={2} className={styles.sectionTitle}>Optimized Ingredients</Title>
            <Table 
                dataSource={ingredients?.optimizedIngredients}
                columns={columns}
                className={styles.table}
                pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                }}
                rowKey="id"
            />

            <p className={styles.lastUpdated}>
                Last updated: {new Date(ingredients?.lastUpdated).toLocaleString()}
            </p>
            
            <Button 
                type="primary" 
                size="large"
                className={styles.placeOrderBtn}
                onClick={() => navigate('/place-order')}
            >
                Place the Order
            </Button>
        </div>
    );
};

export default Order;