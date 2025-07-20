import { Layout, Modal } from 'antd';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import axios from 'axios';
import Navbar from '../../organisms/SuperAdmin/components/Navbar/Navbar.jsx';
import AppHeader from '../../organisms/SuperAdmin/components/AppHeader/AppHeader.jsx';
import OrganizationList from '../../organisms/SuperAdmin/pages/Organizations/Organization List/OrganizationList.jsx';
import AddOrganizationModal from '../../organisms/SuperAdmin/pages/Organizations/Add Organization/AddOrganizationModal.jsx';
import UpdateOrganizationModal from '../../organisms/SuperAdmin/pages/Organizations/Update Organizations/updateOrganiztionModal.jsx';
import RolesList from '../../organisms/SuperAdmin/pages/Roles/RolesList.jsx';
import PermissionsList from '../../organisms/SuperAdmin/pages/Permissions/PermissionsList.jsx';
import Loading from "../../atoms/loading/loading.jsx";
import styles from './SuperAdmin.module.css';

const { Content } = Layout;
const { confirm } = Modal;

const SuperAdmin = () => {
  const [activeMenu, setActiveMenu] = useState('organizations');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { superAuthData } = useAuth();

  const [rolesData] = useState([
    { key: '1', name: 'Super Admin', description: 'Full system access', permissions: 15 },
    { key: '2', name: 'Admin', description: 'Organization admin access', permissions: 10 },
    { key: '3', name: 'Manager', description: 'Department management access', permissions: 7 },
    { key: '4', name: 'Employee', description: 'Basic employee access', permissions: 3 },
  ]);

  const [permissionsData] = useState([
    { key: '1', name: 'User Management', description: 'Manage users: create, edit, delete, and view user accounts.' },
    { key: '2', name: 'Meal Management', description: 'Manage meals: add, edit, delete, and view meal items.' },
    { key: '3', name: 'Reports', description: 'Access and export system reports.' },
  ]);

  const token = superAuthData?.accessToken;

  const mapOrganizations = (orgs) => orgs.map(org => ({
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

  const fetchOrganizations = async () => {
    if (!token) {
      console.error('Token not found');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/super-admin/organizations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(mapOrganizations(res.data));
    } catch (err) {
      console.error('Failed to fetch organizations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleMenuChange = (menuKey) => {
    setActiveMenu(menuKey);
  };

  const getPageTitle = () => {
    switch (activeMenu) {
      case 'organizations': return 'Organizations';
      case 'roles': return 'Administrators';
      case 'permissions': return 'Permissions';
      default: return 'Super Administrator';
    }
  };

  const showModal = () => setIsModalVisible(true);

  const handleOk = async (values) => {
    if (!token) return;
    try {
      await axios.post('http://localhost:3000/super-admin/organizations', values, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      await fetchOrganizations();
      setIsModalVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleUpdate = (item) => {
    setSelectedItem({ ...item, contactEmail: item.domain });
    setIsUpdateModalVisible(true);
  };

  const updateOrganization = async (orgId, values) => {
    if (!token) return;
    try {
      await axios.put(`http://localhost:3000/super-admin/organizations/${orgId}`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      await fetchOrganizations();
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
        if (!token) return;
        try {
          await axios.delete(`http://localhost:3000/super-admin/organizations/${item.key}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await fetchOrganizations();
        } catch (err) {
          console.error('Failed to delete organization', err);
        }
      },
      onCancel() {
        console.log('Delete cancelled');
      },
    });
  };

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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar
        className={styles.sider}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
      />
      <Layout>
        <AppHeader title={getPageTitle()} />
        <Content className={styles.content} style={{ padding: 24 }}>
          {loading ? <Loading /> : renderContent()}
        </Content>
      </Layout>

      {activeMenu === 'organizations' && (
        <>
          <AddOrganizationModal
            visible={isModalVisible}
            onSubmit={handleOk}
            onCancel={handleCancel}
            className={styles.modal}
          />
          <UpdateOrganizationModal
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