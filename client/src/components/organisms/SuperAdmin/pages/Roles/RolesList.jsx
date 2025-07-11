import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './RolesList.module.css';
import axios from 'axios';

const RolesList = ({ data, onAddNew, onUpdate, onDelete, className, authData}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const urL = import.meta.env.VITE_BASE_URL;
  const auth0Url = import.meta.env.VITE_AUTH0_URL;
  const auth0Id = import.meta.env.VITE_AUTH0_ID;

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

  // Fetch organizations on mount
  useEffect(() => {
    axios.get(`${urL}/super-admin/organizations`)
      .then(res => setOrganizations(res.data))
      .catch(() => setOrganizations([]));
  }, []);

  // Fetch users for selected organization
  const fetchOrgUsers = React.useCallback(() => {
    if (!selectedOrg) {
      setOrgUsers([]);
      return;
    }
    setOrgLoading(true);
    axios.get(`${urL}/super-admin/admins/${selectedOrg}`, {
      headers: { Authorization: `Bearer ${authData?.accessToken}` },
    })
      .then(res => setOrgUsers(res.data))
      .catch((err) => {
        setOrgUsers([]);
        message.error(
          err.response?.data?.message || "Failed to fetch organization users"
        );
      })
      .finally(() => setOrgLoading(false));
  }, [selectedOrg, authData, urL]);

  useEffect(() => {
    fetchOrgUsers();
  }, [fetchOrgUsers]);

  // Main registration handler
  const handleRegister = async (values) => {
    setLoading(true);
    const { employeeId, name, role, email, password } = values;
    try {
      const token = authData?.accessToken;
      const payload = {
        id: employeeId,
        name,
        role,
        email,
        password,
        organizationId: localStorage.getItem('orgid') || selectedOrg,
        dob : "1990-01-01",
        telephone : "+1234567890",
        gender : "male",
        address : "123 Street, City",  
        salary: 50000,                             
      };
      await axios.post(`${urL}/super-admin/users`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await signUpUser({ email, password, id: employeeId });
      message.success("User Registered Successfully");
      setIsModalVisible(false);
      form.resetFields();
      fetchOrgUsers(); // <-- Fetch users after adding
    } catch (err) {
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

  const handleOrgChange = (orgId) => {
    setSelectedOrg(orgId);
    localStorage.setItem('orgid', orgId);
  };

  const handleDelete = async (id, email) => {
    setLoading(true);
    console.log(email);
    const token = authData?.accessToken;
    try {
      await axios.delete(`${urL}/super-admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await axios.post(`${urL}/auth/delete`, { email: email }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("User Removed Successfully!");
      fetchOrgUsers(); // <-- Fetch users after deleting
    } catch (err) {
      console.log(err);
      message.error("Something went Wrong!");
    }
    setLoading(false);
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
          className={styles.roleDropdown}
        >
          {organizations.map(org => (
            <Select.Option key={org.id} value={org.id}>{org.name}</Select.Option>
          ))}
        </Select>
      </div>

      {/* Add New Role Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showModal}
          className={styles.addButton}
          disabled={!selectedOrg}
        >
          Add New Role
        </Button>
      </div>

      {/* Organization Users Table with Actions */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ color: '#1890ff', marginBottom: 8 }}>Organization Users</h3>
        <Table
          columns={[
            { title: 'ID', dataIndex: 'id', key: 'id' },
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Role', dataIndex: 'role', key: 'role' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
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
                    onClick={() => handleDelete(record.id, record.email)}
                    className={styles.deleteButton}
                    loading={loading}
                  >
                    Delete
                  </Button>
                </Space>
              ),
            },
          ]}
          dataSource={orgUsers}
          loading={orgLoading}
          rowKey="id"
          pagination={false}
          className={styles.table}
          style={{ marginBottom: 24 }}
        />
      </div>

      {/* Modal for Add New Role */}
      <Modal
        title="Add New Role"
        open={isModalVisible}
        onOk={handleAdd}
        onCancel={handleCancel}
        okText="Add"
        cancelText="Cancel"
        modalRender={modal => (
          <div className={styles.container}>{modal}</div>
        )}
        footer={null}
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
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input the Name!' }]}>
            <Input placeholder="Enter Name" />
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <Button type="primary" onClick={handleAdd} className={styles.submitButton}>
            Add
          </Button>
          <Button onClick={handleCancel} className={styles.cancelButton}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RolesList;