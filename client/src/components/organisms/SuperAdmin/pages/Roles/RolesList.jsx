import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './RolesList.module.css';

const RolesList = ({ data, onAddNew, onUpdate, onDelete, className }) => {
  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (count) => <Tag color="blue">{count} permissions</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => onUpdate(record)}
            className={styles.editButton}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => onDelete(record)}
            className={styles.deleteButton}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Roles Management</h2>
          <div className={styles.actions}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={onAddNew}
              className={styles.addButton}
            >
              Add New Role
            </Button>
          </div>
        </div>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={{ pageSize: 10 }}
        className={styles.table} // Ensure this is applied
        rowKey="id"
      />
    </div>
  );
};

export default RolesList;