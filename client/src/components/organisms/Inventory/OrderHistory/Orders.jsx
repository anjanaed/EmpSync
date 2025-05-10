import React, { useState, useEffect } from "react";
import { Table, Card, Typography, Tag, Space } from "antd";
import axios from "axios";
import styles from './Orders.module.css';
const urL = import.meta.env.VITE_BASE_URL;

const { Title } = Typography;

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${urL}/ingredients/orders`);
            // Filter orders to only include those with non-empty ingredients
            const filteredOrders = response.data.map(order => {
                const allIngredients = [
                    ...(order.ingredients.priority1Ingredients || []),
                    ...(order.ingredients.optimizedIngredients || [])
                ];
                return {
                    ...order,
                    ingredients: {
                        ...order.ingredients,
                        allIngredients: allIngredients.filter(ing => ing.quantity > 0)
                    }
                };
            }).filter(order => order.ingredients.allIngredients.length > 0);
            
            setOrders(filteredOrders);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (type) => (
                <Tag className={styles.tag} color="blue">{type}</Tag>
            ),
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Price per Unit",
            dataIndex: "price_per_unit",
            key: "price_per_unit",
            render: (price) => <span className={styles.priceText}>Rs. {price}</span>,
        },
        {
            title: "Total Cost",
            dataIndex: "totalCost",
            key: "totalCost",
            render: (cost) => <span className={styles.priceText}>Rs. {cost}</span>,
        },
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            render: (priority) => (
                <Tag 
                    className={styles.tag}
                    color={priority === 1 ? "red" : priority === 2 ? "orange" : "green"}
                >
                    Priority {priority}
                </Tag>
            ),
        },
    ];

    const orderColumns = [
        {
            title: "Order Date",
            dataIndex: "lastUpdated",
            key: "lastUpdated",
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: "Total Budget",
            dataIndex: "budget",
            key: "budget",
            render: (budget) => `Rs. ${budget}`,
        },
        {
            title: "Priority 1 Budget",
            dataIndex: "priority1Budget",
            key: "priority1Budget",
            render: (budget) => `Rs. ${budget}`,
        },
        {
            title: "Other Priority Budget",
            dataIndex: "otherPriorityBudget",
            key: "otherPriorityBudget",
            render: (budget) => `Rs. ${budget}`,
        },
        {
            title: "Total Cost",
            dataIndex: "totalCost",
            key: "totalCost",
            render: (cost) => `Rs. ${cost}`,
        }
    ];

    const expandedRowRender = (order) => {
        const allIngredients = [
            ...(order.ingredients.priority1Ingredients || []),
            ...(order.ingredients.optimizedIngredients || [])
        ].filter(ing => ing.quantity > 0);

        return (
            <div className={styles.expandedRow}>
                <Table
                    columns={columns}
                    dataSource={allIngredients}
                    pagination={false}
                    rowKey="id"
                    className={styles.table}
                />
            </div>
        );
    };

    return (
        <div className={styles.ordersContainer}>
            <Space direction="vertical" style={{ width: "100%" }}>
                <div className={styles.titleSection}>
                    <Title level={2} className={styles.title}>Orders History</Title>
                </div>
                <Card className={styles.card}>
                    <Table
                        columns={orderColumns}
                        dataSource={orders}
                        expandable={{
                            expandedRowRender,
                        }}
                        rowKey="id"
                        loading={loading}
                        className={styles.table}
                    />
                </Card>
            </Space>
        </div>
    );
};

export default Orders;
