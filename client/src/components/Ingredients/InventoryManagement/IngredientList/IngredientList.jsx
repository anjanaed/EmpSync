import React from 'react';
import { Table, Button, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined, DownOutlined } from '@ant-design/icons';
import IngredientItem from '../IngredientItem/IngredientItem';
import styles from './IngredientList.module.css';

const IngredientList = ({ ingredients, onEdit, onDelete }) => {
  const columns = [
    {
      title: 'Ingredient',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (_, record) => `${record.quantity} ${record.unit}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`${styles.status} ${status === 'Low Stock' ? styles.lowStock : styles.inStock}`}>
          {status}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Ingredient List</h2>
        <p className={styles.subtitle}>Manage your inventory of ingredients and supplies</p>
      </div>
      
      <Table 
        dataSource={ingredients} 
        columns={columns} 
        rowKey="id" 
        pagination={false}
        className={styles.table}
      />
      
      <div className={styles.footer}>
        <Button className={styles.detailsButton}>
          Ingredient Details
        </Button>
        
        <Dropdown menu={{ items }} placement="bottomRight">
          <Button className={styles.exportButton}>
            Export <DownOutlined />
          </Button>
        </Dropdown>
      </div>
    </div>
  );
};

export default IngredientList;