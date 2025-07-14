import { Button, Input, List, Avatar, Row, Col, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';
import styles from './OrganizationList.module.css';

const OrganizationList = ({ data, onAddNew, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(organization => 
      organization.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organization.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <p className={styles.title}>Current Organizations</p>
          <Space className={styles.actions} wrap>
            <Input.Search 
              placeholder="Search by company name" 
              className={styles.searchInput}
              allowClear
              value={searchTerm}
              onSearch={handleSearch}
              onChange={handleSearchChange}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={onAddNew}
              className={styles.addButton}
            >
              Add New
            </Button>
          </Space>
        </div>
      </div>
      
      <List
        className={styles.list}
        itemLayout="horizontal"
        dataSource={filteredData}
        pagination={{ 
          pageSize: 5, 
          total: filteredData.length, 
          showSizeChanger: false,
          responsive: true
        }}
        renderItem={item => (
          <List.Item className={styles.listItem}>
            <div className={styles.itemContent}>
              <div className={styles.itemInfo}>
                <Avatar 
                  style={{ backgroundColor: item.color }}
                  className={styles.avatar}
                >
                  {item.letter}
                </Avatar>
                <div className={styles.itemDetails}>
                  <div className={styles.itemTitle}>{item.name}</div>
                  <div className={styles.itemMeta}>
                    <span style={{ color: 'white' }}>{item.domain}</span>
                    <span style={{ margin: '0 12px', color: 'white' }}>|</span>
                    <span style={{ color: 'white' }}>Fingerprint Limit: {item.fingerprint_capacity}</span>
                    <span style={{ margin: '0 12px', color: 'white' }}>|</span>
                    <span style={{ color: 'white' }}>Fingerprints per Machine: {item.fingerprint_per_machine}</span>
                  </div>
                </div>
              </div>
              <div className={styles.itemActions}>
                <Button 
                  type="default"
                  size="small"
                  icon={<EditOutlined />} 
                  onClick={() => onUpdate(item)}
                  className={styles.updateButton}
                >
                  Update
                </Button>
                <Button 
                  type="default"
                  size="small"
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => onDelete(item)}
                  className={styles.deleteButton}
                >
                  Delete
                </Button>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default OrganizationList;