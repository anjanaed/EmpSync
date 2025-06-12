import { Layout, Modal } from 'antd';
import { useState } from 'react';
import Navbar from '../../organisms/SuperAdmin/components/Navbar/Navbar';
import AppHeader from '../../organisms/SuperAdmin/components/AppHeader/AppHeader';
import OrganizationList from '../../organisms/SuperAdmin/pages/Organizations/OrganizationList';
import AddOrganizationModal from '../../organisms/SuperAdmin/pages/Organizations/AddOrganizationModal';
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
  const [data, setData] = useState([
    { key: '1', name: 'ABC Company', domain: 'abccompany.com', color: '#9254DE', letter: 'A' },
    { key: '2', name: 'XYZ Company', domain: 'xyzcompany.com', color: '#F5222D', letter: 'X' },
    { key: '3', name: 'LMK Company', domain: 'lmkcompany.com', color: '#FAAD14', letter: 'L' },
    { key: '4', name: 'PQR Company', domain: 'pqrcompany.com', color: '#52C41A', letter: 'P' },
    { key: '5', name: 'HJK Company', domain: 'hjkcompany.com', color: '#1890FF', letter: 'H' },
    { key: '6', name: 'XYZ Company', domain: 'xyzcompany.com', color: '#F5222D', letter: 'X' },
  ]);

  // Sample roles data
  const [rolesData, setRolesData] = useState([
    { key: '1', name: 'Super Admin', description: 'Full system access', permissions: 15 },
    { key: '2', name: 'Admin', description: 'Organization admin access', permissions: 10 },
    { key: '3', name: 'Manager', description: 'Department management access', permissions: 7 },
    { key: '4', name: 'Employee', description: 'Basic employee access', permissions: 3 },
  ]);

  // Sample permissions data
  const [permissionsData, setPermissionsData] = useState([
    { key: '1', name: 'Create Users', category: 'User Management', description: 'Create new user accounts' },
    { key: '2', name: 'Edit Users', category: 'User Management', description: 'Modify user information' },
    { key: '3', name: 'Delete Users', category: 'User Management', description: 'Remove user accounts' },
    { key: '4', name: 'View Reports', category: 'Analytics', description: 'Access system reports' },
    { key: '5', name: 'Export Data', category: 'Analytics', description: 'Export system data' },
  ]);

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
            onAddNew={() => {/* Handle add role */}}
            onUpdate={() => {/* Handle update role */}}
            onDelete={() => {/* Handle delete role */}}
            className={styles.listItem}
          />
        );
      case 'permissions':
        return (
          <PermissionsList 
            data={permissionsData}
            onAddNew={() => {/* Handle add permission */}}
            onUpdate={() => {/* Handle update permission */}}
            onDelete={() => {/* Handle delete permission */}}
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

  const handleOk = (values) => {
    setData([...data, { 
      key: (data.length + 1).toString(), 
      name: values.name, 
      domain: values.domain, 
      color: '#9254DE', 
      letter: values.name.charAt(0).toUpperCase() 
    }]);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleUpdate = (item) => {
    setSelectedItem(item);
    setIsUpdateModalVisible(true);
  };

  const handleUpdateOk = (values) => {
    setData(data.map(item => 
      item.key === selectedItem.key 
        ? { 
            ...item, 
            name: values.name, 
            domain: values.domain, 
            letter: values.name.charAt(0).toUpperCase() 
          }
        : item
    ));
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
      onOk() {
        setData(data.filter(dataItem => dataItem.key !== item.key));
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
          <AddOrganizationModal 
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