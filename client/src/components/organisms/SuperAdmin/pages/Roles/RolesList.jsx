import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './RolesList.module.css';
import axios from 'axios';

const RolesList = ({ data, onAddNew, onUpdate, onDelete, className, urL, authData, auth0Url, auth0Id, navigate }) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Helper: Auth0 registration
  const signUpUser = async ({ email, password, id }) => {
    try {
      await axios.post(`https://${auth0Url}/dbconnections/signup`, {
        client_id: auth0Id,
        email,
        username: id,
        password,
        connection: "Username-Password-Authentication",
      });
    } catch (err) {
      console.error("Auth0 Registration Error:", err);
      message.error(`Registration Failed: ${err.response?.data?.message || err.message}`);
      setLoading(false);
      throw err;
    }
  };

  // Main registration handler
  const handleRegister = async (values) => {
    setLoading(true);
    let role = values.role || values.jobRole;
    if (role === "Other") {
      role = values.customJobRole;
    }
    const {
      id,
      name,
      dob,
      tel,
      gender,
      address,
      email,
      password,
      supId,
      lang,
      salary,
    } = values;
    try {
      const token = authData?.accessToken;
      const payload = {
        id,
        name,
        role,
        dob: null,
        telephone: null,
        gender: null,
        address: null,
        email,
        password,
        supId: null,
        language: null,
        salary: null,
      };
      console.log("Payload for registration:", payload);
      await axios.post(`${urL}/user`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      message.error(`Registration Failed: ${err.response?.data?.message || "Unknown error"}`);
      setLoading(false);
      return;
    }
    try {
      await signUpUser({ email, password, id });
      message.success("User Registered Successfully");
      if (navigate) navigate("/EmployeePage");
      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      const token = authData?.accessToken;
      await axios.delete(`${urL}/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.error("Registration Error:", err);
      message.error(`Registration Failed: ${err.response?.data?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form
      .validateFields()
      .then(values => {
        handleRegister(values);
      })
      .catch(() => {});
  };

  // Fetch organizations on mount
  useEffect(() => {
    axios.get('http://localhost:3000/super-admin/organizations')
      .then(res => setOrganizations(res.data))
      .catch(() => setOrganizations([]));
  }, []);

  // Fetch users for selected organization
  useEffect(() => {
    if (!selectedOrg) {
      setOrgUsers([]);
      return;
    }
    setOrgLoading(true);
    axios.get(`${urL}/organization/${selectedOrg}/users`, {
      headers: { Authorization: `Bearer ${authData?.accessToken}` },
    })
      .then(res => setOrgUsers(res.data))
      .catch(() => setOrgUsers([]))
      .finally(() => setOrgLoading(false));
  }, [selectedOrg, urL, authData]);

  // Group users by role
  const groupedUsers = orgUsers.reduce((acc, user) => {
    const role = user.role;
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {});

  // Handle organization selection
  const handleOrgChange = (orgId) => {
    setSelectedOrg(orgId);
    localStorage.setItem('orgid', orgId);
  };

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
      {/* Organization Dropdown */}
      <div style={{ marginBottom: 24, maxWidth: 400 }}>
        <Select
          showSearch
          placeholder="Select Organization"
          optionFilterProp="children"
          onChange={handleOrgChange}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          style={{ width: '100%' }}
          value={selectedOrg}
        >
          {organizations.map(org => (
            <Select.Option key={org.id} value={org.id}>{org.name}</Select.Option>
          ))}
        </Select>
      </div>

      {/* Show users by role for selected organization */}
      {selectedOrg && (
        <div style={{ marginBottom: 32 }}>
          {orgLoading ? (
            <div>Loading users...</div>
          ) : (
            ['HR_ADMIN', 'KITCHEN_ADMIN', 'KITCHEN_STAFF'].map(role => (
              <div key={role} style={{ marginBottom: 16 }}>
                <h3 style={{ color: '#1890ff', marginBottom: 8 }}>{role.replace('_', ' ')}</h3>
                {groupedUsers[role] && groupedUsers[role].length > 0 ? (
                  <ul style={{ color: '#d9d9d9' }}>
                    {groupedUsers[role].map(user => (
                      <li key={user.id}>
                        {user.name} (Assigned by: {user.assignedByName || user.assignedBy || 'Unknown'})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ color: '#888' }}>No users assigned.</div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Roles Management</h2>
          <div className={styles.actions}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showModal}
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
        className={styles.table}
        rowKey="id"
      />
      <Modal
        title="Add New Role"
        open={isModalVisible}
        onOk={handleAdd}
        onCancel={handleCancel}
        okText="Add"
        cancelText="Cancel"
        footer={[
          <Button key="add" type="primary" onClick={handleAdd} className={styles.submitButton}>
            Add
          </Button>,
          <Button key="cancel" onClick={handleCancel} className={styles.cancelButton}>
            Cancel
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="add_role_form"
        >
          <Form.Item
            label="Employee ID"
            name="employeeId"
            rules={[{ required: true, message: 'Please input the Employee ID!' }]}
          >
            <Input placeholder="Enter Employee ID" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input placeholder="Enter Email" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input the password!' }]}
            hasFeedback
          >
            <Input.Password placeholder="Enter Password" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm the password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role!' }]}
            className={styles.roleDropdown}
          >
            <Select placeholder="Select Role">
              <Select.Option value="HR_ADMIN">Human Resource Manager</Select.Option>
              <Select.Option value="KITCHEN_ADMIN">Kitchen Administrator</Select.Option>
              <Select.Option value="KITCHEN_STAFF">Kitchen Staff</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            shouldUpdate={(prev, curr) => prev.role !== curr.role}
            noStyle
          >
            {() => null}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolesList;