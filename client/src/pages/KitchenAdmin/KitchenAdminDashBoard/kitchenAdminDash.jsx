import React, { useState } from 'react';
import { 
  Layout, 
  Button, 
  Card, 
  List, 
  Typography, 
  Divider,
  DatePicker
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import moment from 'moment';
import Navbar from "../../../components/KitchenAdmin/KitchenNavbar/navbar";
import styles from './kitchenAdminDash.module.css';


const { Content } = Layout;
const { Title } = Typography;

const MenuManagementPage = () => {
  const [activeTab, setActiveTab] = useState('breakfast');
  const [selectedDate, setSelectedDate] = useState(moment());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Menu items for each tab
  const menuItems = {
    breakfast: [
      'String Hoppers',
      'Hoppers',
      'Bread with Curry',
      'Milk Rice',
      'Egg Hoppers'
    ],
    lunch: [
      'Rice & Curry',
      'String Hoppers',
      'Noodles',
      'Hoppers',
      'Bread with Curry'
    ],
    dinner: [
      'Fried Rice',
      'Kottu',
      'Rice & Curry',
      'Noodles',
      'Biryani'
    ]
  };

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      setIsDatePickerOpen(false);
    }
  };

  const toggleDatePicker = () => {
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const formattedDate = selectedDate.format('MMMM D, YYYY');

  // Get the current menu items based on active tab
  const currentMenuItems = menuItems[activeTab] || [];

  return (
    <Layout className={styles.layout}>
      {/* <Navbar /> */}
      <Content className={styles.content}>
        <Card className={styles.card}>
          <div className={styles.titleContainer}>
            <Title level={3} className={styles.menuTitle}>{formattedDate} Menu</Title>
            <div className={styles.datePickerContainer}>
              <Button 
                className={styles.selectDateButton} 
                icon={<CalendarOutlined />}
                onClick={toggleDatePicker}
              >
                Select Date
              </Button>
              {isDatePickerOpen && (
                <div className={styles.datePickerDropdown}>
                  <DatePicker 
                    open={isDatePickerOpen}
                    value={selectedDate}
                    onChange={handleDateChange}
                    onOpenChange={(open) => {
                      if (!open) setIsDatePickerOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.customTabsContainer}>
            <div className={styles.customTabs}>
              <div 
                className={`${styles.customTab} ${activeTab === 'breakfast' ? styles.activeTab : ''}`}
                onClick={() => handleTabChange('breakfast')}
              >
                Breakfast Sets
              </div>
              <div 
                className={`${styles.customTab} ${activeTab === 'lunch' ? styles.activeTab : ''}`}
                onClick={() => handleTabChange('lunch')}
              >
                Lunch Set
              </div>
              <div 
                className={`${styles.customTab} ${activeTab === 'dinner' ? styles.activeTab : ''}`}
                onClick={() => handleTabChange('dinner')}
              >
                Dinner Set
              </div>
            </div>
          </div>
          
          <div className={styles.menuContainer}>
            <div className={styles.menuList}>
              <List
                dataSource={currentMenuItems}
                renderItem={(item, index) => (
                  <>
                    <List.Item className={styles.menuItem}>
                      <Typography.Text>{item}</Typography.Text>
                    </List.Item>
                    {index < currentMenuItems.length - 1 && <Divider className={styles.divider} />}
                  </>
                )}
              />
            </div>
            
            <div className={styles.actionContainer}>
              <Button 
                className={styles.updateButton} 
                icon={<PlusOutlined />}
              >
                <span className={styles.buttonLabel}>Update Menu</span>
              </Button>
              
              <Button 
                className={styles.removeButton} 
                icon={<DeleteOutlined />}
              >
                <span className={styles.buttonLabel}>Remove Schedule</span>
              </Button>
              
              <Button 
                type="primary" 
                className={styles.confirmButton}
              >
                Confirm Schedule
              </Button>
            </div>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default MenuManagementPage;