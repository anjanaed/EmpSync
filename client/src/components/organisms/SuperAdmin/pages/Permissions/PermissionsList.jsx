import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Select, Card, Checkbox, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import styles from './PermissionsList.module.css';

const { Option } = Select;

const PermissionsList = ({ 
  data, 
  organizations, 
  roles, 
  onAddNew, 
  onUpdate, 
  onDelete, 
  onAssignPermissions,
  className 
}) => {
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);

  useEffect(() => {
    if (selectedOrganization) {
      const orgRoles = roles?.filter(role => role.organizationId === selectedOrganization) || [];
      setFilteredRoles(orgRoles);
      setSelectedRole(null);
      setRolePermissions([]);
    }
  }, [selectedOrganization, roles]);

  useEffect(() => {
    if (selectedRole) {
      const role = filteredRoles.find(r => r.id === selectedRole);
      setRolePermissions(role?.permissions || []);
    }
  }, [selectedRole, filteredRoles]);

  const handleOrganizationChange = (value) => {
    setSelectedOrganization(value);
  };

  const handleRoleChange = (value) => {
    setSelectedRole(value);
  };

  const handlePermissionChange = (permissionId, checked) => {
    if (checked) {
      setRolePermissions([...rolePermissions, permissionId]);
    } else {
      setRolePermissions(rolePermissions.filter(id => id !== permissionId));
    }
  };

  const handleSavePermissions = () => {
    if (selectedRole && onAssignPermissions) {
      onAssignPermissions(selectedRole, rolePermissions);
    }
  };

  const columns = [
    {
      title: 'Permission Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag className={styles.categoryTag}>{category}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Assigned',
      key: 'assigned',
      render: (_, record) => (
        <div className={styles.assignedCheckbox}>
          <Checkbox
            checked={rolePermissions.includes(record.id)}
            onChange={(e) => handlePermissionChange(record.id, e.target.checked)}
            disabled={!selectedRole}
          />
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="default" 
            size="small"
            icon={<EditOutlined />} 
            onClick={() => onUpdate(record)}
            className={`${styles.actionButton} ${styles.editButton}`}
          >
            Edit
          </Button>
          <Button 
            type="default" 
            size="small"
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => onDelete(record)}
            className={`${styles.actionButton} ${styles.deleteButton}`}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <Card title="Permission Management" className={styles.permissionCard}>
        <div className={styles.controlsContainer}>
          <div className={styles.selectGroup}>
            <label className={styles.selectLabel}>Organization:</label>
            <Select
              placeholder="Select Organization"
              className={styles.selectControl}
              value={selectedOrganization}
              onChange={handleOrganizationChange}
            >
              {organizations?.map(org => (
                <Option key={org.id} value={org.id}>
                  {org.name}
                </Option>
              ))}
            </Select>
          </div>
          
          <div className={styles.selectGroup}>
            <label className={styles.selectLabel}>Role:</label>
            <Select
              placeholder="Select Role"
              className={styles.selectControl}
              value={selectedRole}
              onChange={handleRoleChange}
              disabled={!selectedOrganization}
            >
              {filteredRoles.map(role => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
            
          </div>

          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSavePermissions}
            disabled={!selectedRole || rolePermissions.length === 0}
            className={styles.saveButton}
          >
            Save Permissions
          </Button>
        </div>
        
        {selectedRole && (
          <div className={styles.roleInfo}>
            <Tag className={styles.roleTag}>
              Selected Role: {filteredRoles.find(r => r.id === selectedRole)?.name}
            </Tag>
            <Tag className={styles.permissionTag}>
              Permissions: {rolePermissions.length}
            </Tag>
          </div>
        )}
      </Card>

      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={onAddNew}
        className={styles.addButton}
      >
        Add New Permission
      </Button>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={{ pageSize: 3 }}
        rowKey="id"
        className={styles.table}
      />
    </div>
  );
};

export default PermissionsList;