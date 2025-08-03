import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../../../../../contexts/AuthContext.jsx';
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

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);

  const { superAuthData } = useAuth();
  const { confirm } = Modal;

  const urL = import.meta.env.VITE_BASE_URL;
  const auth0Url = import.meta.env.VITE_AUTH0_URL;
  const auth0Id = import.meta.env.VITE_AUTH0_ID;
  const token = superAuthData?.accessToken;

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
      console.error("Auth0 Registration Error:", err.response?.data || err);
      message.error(`Registration Failed: ${err.response?.data?.message || err.message}`);
      setLoading(false);
      throw err;
    }
  };

  // Fetch organizations on mount
  useEffect(() => {
    axios.get(`${urL}/super-admin/organizations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
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
      headers: { Authorization: `Bearer ${token}` },
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
    const { name, role, email, password } = values;
    const orgId = localStorage.getItem('orgid') || selectedOrg;

    // Get last employee ID
    const lastIdRes = await axios.get(`${urL}/super-admin/organizations/${orgId}/last-employee-id`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    let newEmployeeId;
    const lastEmployeeId = lastIdRes.data;
    if (!lastEmployeeId) {
      newEmployeeId = `${orgId}E001`;
    } else {
      // lastEmployeeId is like "O002E004"
      const match = lastEmployeeId.match(/(.*E)(\d+)$/);
      if (match) {
        const prefix = match[1];
        const num = String(parseInt(match[2], 10) + 1).padStart(3, '0');
        newEmployeeId = `${prefix}${num}`;
      } else {
        newEmployeeId = `${orgId}E001`;
      }
    }

    try {
      // Add to database
      const payload = {
        id: newEmployeeId,
        name,
        role,
        email,
        organizationId: orgId,
        dob: "1990-01-01",
        telephone: "+1234567890",
        gender: "Male",
        address: "123 Street, City",
        salary: 50000,
      };
      await axios.post(`${urL}/super-admin/users`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    catch (err) {
      error(
        `Registration Failed: ${err.response?.data?.message || "Unknown error"}`
      );
      setLoading(false);
      return;
    }

    try {
      // Register with Auth0 
      await signUpUser({ email, password, id: newEmployeeId });
      message.success("User Registered Successfully");
      setIsModalVisible(false);
      form.resetFields();
      fetchOrgUsers();
    }
    catch (err) {
      await axios.delete(`${urL}/super-admin/users/${newEmployeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.error(`Registration Failed: ${err.response?.data?.message || "Unknown error"}`);
      console.error("Registration Error:", err);
      error(
        `Registration Failed: ${err.response?.data?.message || "Unknown error"}`
      );
    }
    finally {
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

const handleDelete = (id, email) => {
    confirm({
      title: 'Are you sure you want to delete this user?',
      content: `This will permanently delete the user with email "${email}" and cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      className: styles.customConfirm,
      async onOk() {
        setLoading(true);
        try {
          await axios.delete(`${urL}/super-admin/users/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          await axios.post(
            `${urL}/superadmin/delete`,
            { email },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          message.success('User Removed Successfully!');
          fetchOrgUsers(); // Refresh user list
        } catch (err) {
          console.log(err);
          message.error('Something went wrong!');
        }
        setLoading(false);
      },
      onCancel() {
        console.log('User deletion cancelled');
      },
    });
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      employeeId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      setLoading(true);
      const payload = {
        id: values.employeeId,
        name: values.name,
        email: values.email,
        role: values.role,
        organizationId: localStorage.getItem('orgid') || selectedOrg,
        // You can include other fields if needed
      };

      await axios.put(`${urL}/super-admin/users/${editingUser.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      message.success("User Updated Successfully");
      setIsEditModalVisible(false);
      setEditingUser(null);
      fetchOrgUsers();
    } catch (err) {
      message.error(`Update Failed: ${err.response?.data?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

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
          dropdownClassName="org-dropdown-dark" // Add this line
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
          Add New Admin
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
                    onClick={() => handleEditClick(record)}
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
          pagination={{ pageSize: 4 }}
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
          disabled={loading}
        >
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
            <Select placeholder="Select Role" dropdownClassName="role-dropdown-dark">
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
          <Button type="primary" onClick={handleAdd} loading={loading} className={styles.submitButton}>
            Add
          </Button>
          <Button onClick={handleCancel} className={styles.cancelButton}>
            Cancel
          </Button>
        </div>
      </Modal>


      {/* Edit Modal */}
      <Modal
        title="Edit User"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingUser(null);
        }}
        footer={null}
        modalRender={(modal) => (
          <div className={styles.container}>{modal}</div>
        )}
      >
        <Form
          form={editForm}
          layout="vertical"
          name="edit_user_form"
        >
          <Form.Item
            label="Employee ID"
            name="employeeId"
            rules={[{ required: true, message: 'Please input the Employee ID!' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input the Name!' }]}
          >
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
        </Form>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <Button type="primary" onClick={handleUpdate} loading={loading} className={styles.submitButton}>
            Update
          </Button>
          <Button onClick={() => setIsEditModalVisible(false)} className={styles.cancelButton}>
            Cancel
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default RolesList;