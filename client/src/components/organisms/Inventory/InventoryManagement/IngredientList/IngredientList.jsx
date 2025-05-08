import React from 'react';
import { Table, Button, Dropdown, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import styles from './IngredientList.module.css';

const IngredientList = ({ ingredients, onEdit, onDelete }) => {
  if (!ingredients || ingredients.length === 0) {
    return <Empty description="No ingredients found" />;
  }

  // Function to get priority label and class
  const getPriorityLabel = (priority) => {
    switch(parseInt(priority)) {
      case 1: return { label: 'High', className: styles.highPriority };
      case 2: return { label: 'Medium', className: styles.mediumPriority };
      case 3: return { label: 'Low', className: styles.lowPriority };
      default: return { label: 'Normal', className: styles.normalPriority };
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Ingredient Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Price Per Unit',
      dataIndex: 'price_per_unit',
      key: 'price_per_unit',
      render: (price) => `Rs. ${price}`,
      sorter: (a, b) => a.price_per_unit - b.price_per_unit,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a, b) => a.priority - b.priority,
      render: (priority) => {
        const { label, className } = getPriorityLabel(priority);
        return (
          <span className={`${styles.status} ${className}`}>
            {label}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className={styles.actions}>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => onEdit(record.id)} 
            className={styles.actionButton}
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            onClick={() => onDelete(record.id)} 
            className={styles.actionButton}
          />
        </div>
      ),
    },
  ];

  const items = [
    {
      key: '1',
      label: 'Ingredient Details',
    },
    {
      key: '2',
      label: 'Export',
      icon: <DownOutlined />,
    },
  ];

  // Convert ingredients to proper format for the table
  const tableData = ingredients.map(ingredient => ({
    ...ingredient,
    key: ingredient.id,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Ingredient List</h2>
      </div>
      
      <Table 
        dataSource={tableData} 
        columns={columns} 
        rowKey="id" 
        pagination={{ pageSize: 10 }}
        className={styles.table}
      />
    </div>
  );
};

export default IngredientList;