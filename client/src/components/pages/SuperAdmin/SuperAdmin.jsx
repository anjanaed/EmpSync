import { Layout, Modal } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../organisms/SuperAdmin/components/Navbar/Navbar';
import AppHeader from '../../organisms/SuperAdmin/components/AppHeader/AppHeader';
import OrganizationList from '../../organisms/SuperAdmin/pages/Organizations/Organization List/OrganizationList';
import AddOrganizationModal from '../../organisms/SuperAdmin/pages/Organizations/Add Organization/AddOrganizationModal';
import UpdateOrganizationModal from '../../organisms/SuperAdmin/pages/Organizations/Update Organizations/updateOrganiztionModal';
import RolesList from '../../organisms/SuperAdmin/pages/Roles/RolesList';
import PermissionsList from '../../organisms/SuperAdmin/pages/Permissions/PermissionsList';
import styles from './SuperAdmin.module.css';

const { Content } = Layout;
const { confirm } = Modal;

const SuperAdmin = () => {
  // Navigation state
  const [activeMenu, setActiveMenu] = useState('organizations'); // 'organizations', 'roles', 'permissions'
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Organizations data
  const [data, setData] = useState([]);

  //  roles data
  const [rolesData, setRolesData] = useState([
    { key: '1', name: 'Super Admin', description: 'Full system access', permissions: 15 },
    { key: '2', name: 'Admin', description: 'Organization admin access', permissions: 10 },
    { key: '3', name: 'Manager', description: 'Department management access', permissions: 7 },
    { key: '4', name: 'Employee', description: 'Basic employee access', permissions: 3 },
  ]);

  //  permissions data
  const [permissionsData, setPermissionsData] = useState([
    { key: '1', name: 'User Management', description: 'Manage users: create, edit, delete, and view user accounts.' },
    { key: '2', name: 'Meal Management', description: 'Manage meals: add, edit, delete, and view meal items.' },
    { key: '3', name: 'Payroll', description: 'Manage payroll: process, edit, and view payroll records.' },
    { key: '4', name: 'Reports', description: 'Access and export system reports.' },
  ]);

  const token = localStorage.getItem('token'); // Or get your token from context/state

  // Fetch organizations from API
  useEffect(() => {
    axios.get('http://localhost:3000/super-admin/organizations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        const orgs = res.data;
        const mapped = orgs.map(org => ({
          key: org.id,
          name: org.name,
          domain: org.contactEmail,
          color: '#9254DE',
          letter: org.name.charAt(0).toUpperCase(),
          logoUrl: org.logoUrl,
          active: org.active,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
          fingerprint_capacity: org.fingerprint_capacity,
          fingerprint_per_machine: org.fingerprint_per_machine,
          users: org.users,
        }));
        setData(mapped);
      })
      .catch(err => {
        console.error('Failed to fetch organizations', err);
      });
  }, []);

  // Navigation handler
  const handleMenuChange = (menuKey) => {
    setActiveMenu(menuKey);
  };

  // Get page title based on active menu
  const getPageTitle = () => {
    switch (activeMenu) {
      case 'organizations':
        return 'Organizations';
      case 'roles':
        return 'Roles';
      case 'permissions':
        return 'Permissions';
      default:
        return 'Super Administrator';
    }
  };

  // Render content based on active menu
  const renderContent = () => {
    switch (activeMenu) {
      case 'organizations':
        return (
          <OrganizationList 
            data={data}
            onAddNew={showModal}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            className={styles.listItem}
          />
        );
      case 'roles':
        return (
          <RolesList 
            data={rolesData}
            className={styles.listItem}
          />
        );
      case 'permissions':
        return (
          <PermissionsList 
            data={permissionsData}
            className={styles.listItem}
          />
        );
      default:
        return null;
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    try {
      await axios.post('http://localhost:3000/super-admin/organizations', values, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const orgsRes = await axios.get('http://localhost:3000/super-admin/organizations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orgs = orgsRes.data;
      const mapped = orgs.map(org => ({
        key: org.id,
        name: org.name,
        domain: org.contactEmail,
        color: '#9254DE',
        letter: org.name.charAt(0).toUpperCase(),
        logoUrl: org.logoUrl,
        active: org.active,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        fingerprint_capacity: org.fingerprint_capacity,
        fingerprint_per_machine: org.fingerprint_per_machine,
        users: org.users,
      }));
      setData(mapped);
      setIsModalVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleUpdate = (item) => {
    // Map domain back to contactEmail for the modal
    setSelectedItem({
      ...item,
      contactEmail: item.domain, // ensure contactEmail is present
    });
    setIsUpdateModalVisible(true);
  };

  // Function to update organization details
  const updateOrganization = async (orgId, values) => {
    try {
      await axios.put(
        `http://localhost:3000/super-admin/organizations/${orgId}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      // Refresh organizations list after update
      const orgsRes = await axios.get('http://localhost:3000/super-admin/organizations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orgs = orgsRes.data;
      const mapped = orgs.map(org => ({
        key: org.id,
        name: org.name,
        domain: org.contactEmail,
        color: '#9254DE',
        letter: org.name.charAt(0).toUpperCase(),
        logoUrl: org.logoUrl,
        active: org.active,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        fingerprint_capacity: org.fingerprint_capacity,
        fingerprint_per_machine: org.fingerprint_per_machine,
        users: org.users,
      }));
      setData(mapped);
    } catch (err) {
      console.error('Failed to update organization', err);
    }
  };

  const handleUpdateOk = async (values) => {
    if (!selectedItem) return;
    await updateOrganization(selectedItem.key, values);
    setIsUpdateModalVisible(false);
    setSelectedItem(null);
  };

  const handleUpdateCancel = () => {
    setIsUpdateModalVisible(false);
    setSelectedItem(null);
  };

  const handleDelete = (item) => {
    confirm({
      title: 'Are you sure you want to delete this organization?',
      content: `This will permanently delete "${item.name}" and cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await axios.delete(`http://localhost:3000/super-admin/organizations/${item.key}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const orgsRes = await axios.get('http://localhost:3000/super-admin/organizations', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const orgs = orgsRes.data;
          const mapped = orgs.map(org => ({
            key: org.id,
            name: org.name,
            domain: org.contactEmail,
            color: '#9254DE',
            letter: org.name.charAt(0).toUpperCase(),
            logoUrl: org.logoUrl,
            active: org.active,
            createdAt: org.createdAt,
            updatedAt: org.updatedAt,
            fingerprint_capacity: org.fingerprint_capacity,
            fingerprint_per_machine: org.fingerprint_per_machine,
            users: org.users,
          }));
          setData(mapped);
        } catch (err) {
          console.error('Failed to delete organization', err);
        }
      },
      onCancel() {
        console.log('Delete cancelled');
      },
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar 
        className={styles.sider} 
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
      />
      <Layout>
        <AppHeader title={getPageTitle()} />
        <Content className={styles.content} style={{padding: 24 }}>
          {renderContent()}
        </Content>
      </Layout>
      
      {/* Show modals only for organizations page */}
      {activeMenu === 'organizations' && (
        <>
          <AddOrganizationModal 
            visible={isModalVisible}
            onSubmit={handleOk}
            onCancel={handleCancel}
            className={styles.modal}
          />
          <UpdateOrganizationModal 
            key={selectedItem?.key || 'new'}
            visible={isUpdateModalVisible}
            onSubmit={handleUpdateOk}
            onCancel={handleUpdateCancel}
            className={styles.modal}
            initialValues={selectedItem}
            title="Update Organization"
          />
        </>
      )}
    </Layout>
  );
};

export default SuperAdmin;