import React, { useState, useEffect } from "react";
import { Typography, Tag, Spin, Button, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { jsPDF } from 'jspdf';  
import autoTable from 'jspdf-autotable';  
import styles from "./Order.module.css";

const urL = import.meta.env.VITE_BASE_URL;
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
            const response = await fetch(`${urL}/ingredients/optimized`);
            const data = await response.json();
            setIngredients(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching ingredients:", error);
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(16);
        doc.text('Ingredients Order Report', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

        // Format data for PDF
        const priority1Data = ingredients?.priority1Ingredients?.map(item => [
            item.name,
            item.type,
            item.price_per_unit,
            item.quantity,
            `Priority ${item.priority}`
        ]);

        const optimizedData = ingredients?.optimizedIngredients?.map(item => [
            item.name,
            item.type,
            item.price_per_unit,
            item.quantity,
            `Priority ${item.priority}`
        ]);

        // Add Priority 1 Ingredients table
        doc.setFontSize(14);
        doc.text('Priority Ingredients', 14, 35);
        autoTable(doc, {  // Changed from doc.autoTable to autoTable(doc
            head: [['Name', 'Type', 'Price (Rs.)', 'Quantity', 'Priority']],
            body: priority1Data || [],
            startY: 40,
        });

        const finalY = doc.lastAutoTable.finalY;
        
        // Add Optimized Ingredients table
        doc.text('Optimized Ingredients', 14, finalY + 15);
        autoTable(doc, {  // Changed from doc.autoTable to autoTable(doc
            head: [['Name', 'Type', 'Price (Rs.)', 'Quantity', 'Priority']],
            body: optimizedData || [],
            startY: finalY + 20,
        });

        // Save the PDF
        doc.save('ingredients-order.pdf');
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className={styles.orderContainer}>
            <div className={styles.headerContainer}>
                <Title level={3} className={styles.mainTitle}>Selected Ingredients for Order</Title>
                <Button 
                    type="default" 
                    size="large"
                    onClick={exportToPDF}
                    className={styles.exportBtn}
                >
                    Export to PDF
                </Button>
            </div>

            <Title level={3} className={styles.sectionTitle}>Priority Ingredients</Title>
            <Table 
                dataSource={ingredients?.priority1Ingredients}
                columns={columns}
                className={styles.table}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                }}
                rowKey="id"
            />

            <Title level={3} className={styles.sectionTitle}>Optimized Ingredients</Title>
            <Table 
                dataSource={ingredients?.optimizedIngredients}
                columns={columns}
                className={styles.table}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                }}
                rowKey="id"
            />

            <p className={styles.lastUpdated}>
                Last updated: {new Date(ingredients?.lastUpdated).toLocaleString()}
            </p>
            
            <div className={styles.buttonContainer}>
                <Button 
                    type="primary" 
                    size="large"
                    className={styles.placeOrderBtn}
                    onClick={() => navigate('/place-order')}
                >
                    Place the Order
                </Button>
            </div>
        </div>
    );
};

export default Order;