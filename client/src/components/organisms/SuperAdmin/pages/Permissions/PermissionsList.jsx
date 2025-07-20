import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Select, Card, Checkbox, Divider, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../../../../../contexts/AuthContext.jsx';
import axios from 'axios';
import styles from './PermissionsList.module.css';

const { Option } = Select;

const PermissionsList = ({ 
  data, 
  onAddNew, 
  onUpdate, 
  onDelete, 
  onAssignPermissions,
  className 
}) => {
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const { superAuthData } = useAuth();
  const urL = import.meta.env.VITE_BASE_URL;

  // Get token from localStorage (or your preferred method)
  const token = superAuthData?.accessToken;

  // Fetch organizations on mount
  useEffect(() => {
    axios.get(`${urL}/super-admin/organizations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => setOrganizations(res.data))
      .catch(err => console.error(err));
  }, [token]);

  // Update users when organization changes
  useEffect(() => {
    if (selectedOrganization) {
      const org = organizations.find(org => org.id === selectedOrganization);
      setUsers(org?.users || []);
      setSelectedUser(null);
      setRolePermissions([]);
      localStorage.setItem('selectedOrganizationId', selectedOrganization);
    }
  }, [selectedOrganization, organizations]);

  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem('selectedUserId', selectedUser);
    }
  }, [selectedUser]);

  // Fetch permissions for selected user
  useEffect(() => {
    if (selectedUser) {
      axios.get(`${urL}/super-admin/users/${selectedUser}/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
        .then(res => {
          setRolePermissions(res.data.map(p => p.action));
        })
        .catch(err => {
          setRolePermissions([]);
          console.error(err);
        });
    } else {
      setRolePermissions([]);
    }
  }, [selectedUser, token]);

  const handleOrganizationChange = (value) => {
    setSelectedOrganization(value);
  };

  const handleUserChange = (value) => {
    setSelectedUser(value);
  };

  const handlePermissionChange = (permissionName, checked) => {
    if (checked) {
      setRolePermissions([...rolePermissions, permissionName]);
    } else {
      setRolePermissions(rolePermissions.filter(name => name !== permissionName));
    }
  };

  const handleSavePermissions = async () => {
  if (selectedUser) {
    const orgId = selectedOrganization;
    const user = users.find(u => u.id === selectedUser);
    const role = user?.role || 'N/A';

    let currentPermissions = [];

    try {
      const res = await axios.get(`${urL}/super-admin/users/${selectedUser}/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      // Get full permission objects
      currentPermissions = res.data;
    } catch (err) {
      currentPermissions = [];
    }

    try {
      // --- Add New Permissions ---
      for (const permissionName of rolePermissions) {
        const alreadyExists = currentPermissions.find(p => p.action === permissionName);
        if (!alreadyExists) {
          const permission = data.find(p => p.name === permissionName);
          if (!permission) continue;

          await axios.post(`${urL}/super-admin/permissions`, {
            orgId,
            action: permission.name,
            role,
            users: {
              connect: [{ id: selectedUser }]
            }
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });
        }
      }

      // --- Remove Unchecked Permissions ---
      for (const currentPermission of currentPermissions) {
        if (!rolePermissions.includes(currentPermission.action)) {
          await axios.delete(`${urL}/super-admin/permissions/${currentPermission.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });
        }
      }

      message.success('Permissions updated successfully!');
    } catch (error) {
      message.error('Failed to update permissions. Please try again.');
      console.error(error);
    }
  }
};


  const columns = [
    {
      title: 'Permission Name',
      dataIndex: 'name',
      key: 'name',
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
            checked={rolePermissions.includes(record.name)}
            onChange={(e) => handlePermissionChange(record.name, e.target.checked)}
            disabled={!selectedUser}
          />
        </div>
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
              dropdownClassName="permission-org-dropdown-dark"
            >
              {organizations.map(org => (
                <Option key={org.id} value={org.id}>
                  {org.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className={styles.selectGroup}>
            <label className={styles.selectLabel}>User:</label>
            <Select
              placeholder="Select User"
              className={styles.selectControl}
              value={selectedUser}
              onChange={handleUserChange}
              disabled={!selectedOrganization}
              dropdownClassName="user-dropdown-dark"
            >
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.name}
                </Option>
              ))}
            </Select>
          </div>

          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSavePermissions}
            disabled={!selectedUser || rolePermissions.length === 0}
            className={styles.saveButton}
          >
            Save Permissions
          </Button>
        </div>
        
        {selectedUser && (
          <div className={styles.roleInfo}>
            <Tag className={styles.roleTag}>
              Selected User: {users.find(u => u.id === selectedUser)?.name}
            </Tag>
            <Tag className={styles.permissionTag}>
              Permissions: {rolePermissions.length}
            </Tag>
            <Tag className={styles.roleTag}>
              Role: {users.find(u => u.id === selectedUser)?.role || 'N/A'}
            </Tag>
          </div>
        )}
      </Card>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={{ pageSize: 4 }}
        rowKey="id"
        className={styles.table}
      />
    </div>
  );
};

export default PermissionsList;