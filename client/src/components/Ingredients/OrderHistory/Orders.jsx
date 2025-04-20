import React, { useState, useEffect } from "react";
import { Table, Card, Typography, Tag, Space } from "antd";
import axios from "axios";

const { Title } = Typography;

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get("http://localhost:3000/ingredients/orders");
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
                <Tag color="blue">{type}</Tag>
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
            render: (price) => `Rs. ${price}`,
        },
        {
            title: "Total Cost",
            dataIndex: "totalCost",
            key: "totalCost",
            render: (cost) => `Rs. ${cost}`,
        },
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            render: (priority) => (
                <Tag color={priority === 1 ? "red" : priority === 2 ? "orange" : "green"}>
                    Priority {priority}
                </Tag>
            ),
        },
    ];

    const expandedRowRender = (order) => {
        return (
            <Table
                columns={columns}
                dataSource={order.ingredients.allIngredients}
                pagination={false}
                rowKey="id"
            />
        );
    };

    const orderColumns = [
        {
            title: "Order Date",
            dataIndex: "lastUpdated",
            key: "lastUpdated",
            render: (date) => new Date(date).toLocaleDateString(),
            width: 200,
        }
    ];

    return (
        <div style={{ padding: "20px" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
                <Title level={2}>Order History</Title>
                <Card>
                    <Table
                        columns={orderColumns}
                        dataSource={orders}
                        expandable={{
                            expandedRowRender,
                        }}
                        rowKey="id"
                        loading={loading}
                    />
                </Card>
            </Space>
        </div>
    );
};

export default Orders;
