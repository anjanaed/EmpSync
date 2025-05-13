import React, { useState } from 'react';
import { DatePicker, Button, Checkbox, TimePicker, Tabs, Input, Modal, Form } from 'antd';
import { PlusOutlined, CloseOutlined, CalendarOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './Calendar.module.css';

const { TabPane } = Tabs;

const MealPlanner = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedMeals, setSelectedMeals] = useState(['breakfast']);
  const [mealTime, setMealTime] = useState({
    breakfast: {
      start: dayjs('07:30', 'HH:mm'),
      end: dayjs('08:30', 'HH:mm')
    },
    lunch: {
      start: null,
      end: null
    },
    dinner: {
      start: null,
      end: null
    }
  });
  const [showTimePickers, setShowTimePickers] = useState({
    breakfast: true,
    lunch: true,
    dinner: true
  });
  const [customMeals, setCustomMeals] = useState({});
  const [activeTab, setActiveTab] = useState('breakfast');
  const [menuItems, setMenuItems] = useState({
    breakfast: ['Milk Rice', 'Peas', 'Hoppers', 'Noodles'],
    lunch: [],
    dinner: [],
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [form] = Form.useForm();

  const handleDateChange = (date) => {
    setCurrentDate(date);
  };

  const handleMealSelection = (meal) => {
    const updatedMeals = [...selectedMeals];
    
    if (updatedMeals.includes(meal)) {
      const index = updatedMeals.indexOf(meal);
      updatedMeals.splice(index, 1);
    } else {
      updatedMeals.push(meal);
    }
    
    setSelectedMeals(updatedMeals);
  };

  const handleStartTimeChange = (time, meal) => {
    setMealTime({
      ...mealTime,
      [meal]: {
        ...mealTime[meal],
        start: time,
      },
    });
  };

  const handleEndTimeChange = (time, meal) => {
    setMealTime({
      ...mealTime,
      [meal]: {
        ...mealTime[meal],
        end: time,
      },
    });
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const removeMenuItem = (item) => {
    const updatedItems = { ...menuItems };
    updatedItems[activeTab] = updatedItems[activeTab].filter(menuItem => menuItem !== item);
    setMenuItems(updatedItems);
  };

  const goToNextDay = () => {
    setCurrentDate(currentDate.add(1, 'day'));
  };

  const showAddMealModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const mealId = `custom_${Date.now()}`;
      
      // Add new custom meal to state
      setCustomMeals(prev => ({
        ...prev,
        [mealId]: {
          name: values.mealName,
        }
      }));

      // Add to selected meals
      setSelectedMeals(prev => [...prev, mealId]);
      
      // Add time slots
      setMealTime(prev => ({
        ...prev,
        [mealId]: {
          start: values.startTime,
          end: values.endTime
        }
      }));

      // Initialize menu items
      setMenuItems(prev => ({
        ...prev,
        [mealId]: []
      }));
      
      // Set time picker visibility
      setShowTimePickers(prev => ({
        ...prev,
        [mealId]: true
      }));

      setIsModalVisible(false);
      setActiveTab(mealId);
    });
  };
  
  const removeMealTime = (mealId) => {
    // Remove the custom meal
    const updatedSelectedMeals = selectedMeals.filter(meal => meal !== mealId);
    setSelectedMeals(updatedSelectedMeals);
    
    // Update active tab if needed
    if (activeTab === mealId) {
      setActiveTab(updatedSelectedMeals[0] || 'breakfast');
    }
    
    // Remove from customMeals if it's a custom meal
    if (mealId.startsWith('custom_')) {
      const updatedCustomMeals = { ...customMeals };
      delete updatedCustomMeals[mealId];
      setCustomMeals(updatedCustomMeals);
      
      // Remove from menuItems
      const updatedMenuItems = { ...menuItems };
      delete updatedMenuItems[mealId];
      setMenuItems(updatedMenuItems);
      
      // Remove from mealTime
      const updatedMealTime = { ...mealTime };
      delete updatedMealTime[mealId];
      setMealTime(updatedMealTime);
      
      // Remove from showTimePickers
      const updatedShowTimePickers = { ...showTimePickers };
      delete updatedShowTimePickers[mealId];
      setShowTimePickers(updatedShowTimePickers);
    }
  };

  const updateMenu = () => {
    console.log("Menu updated");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Menu - {currentDate.format('MMMM D, YYYY')}</h1>
        <div className={styles.dateControls}>
          <Button 
            type="text" 
            className={styles.tomorrowBtn} 
            onClick={goToNextDay}
          >
            Tomorrow <span className={styles.rightArrow}>›</span>
          </Button>
          <DatePicker 
            value={currentDate}
            onChange={handleDateChange}
            bordered={true}
            className={styles.datePicker}
            suffixIcon={<CalendarOutlined />}
            renderExtraFooter={() => "Select Date"}
          />
        </div>
      </div>

      <div className={styles.mealTypeSelection}>
        <div className={styles.horizontalMealContainer}>
          <div className={styles.mealItems}>
            <Checkbox 
              checked={selectedMeals.includes('breakfast')}
              onChange={() => handleMealSelection('breakfast')}
              className={styles.mealCheckbox}
            >
              Breakfast
            </Checkbox>
            
            {selectedMeals.includes('breakfast') && (
              <Button
                type="text"
                size="small"
                onClick={() => toggleTimePicker('breakfast')}
                className={styles.toggleTimeBtn}
              >
                {showTimePickers.breakfast ? 'Hide time' : 'Show time'}
              </Button>
            )}
            
            {selectedMeals.includes('breakfast') && showTimePickers.breakfast && (
              <div className={styles.timePickerGroup}>
                <TimePicker 
                  value={mealTime.breakfast.start}
                  format="HH:mm"
                  onChange={(time) => handleStartTimeChange(time, 'breakfast')}
                  className={styles.timePicker}
                  placeholder="Start time"
                />
                <span className={styles.timePickerSeparator}>to</span>
                <TimePicker 
                  value={mealTime.breakfast.end}
                  format="HH:mm"
                  onChange={(time) => handleEndTimeChange(time, 'breakfast')}
                  className={styles.timePicker}
                  placeholder="End time"
                />
              </div>
            )}
          </div>
          
          <div className={styles.mealItems}>
            <Checkbox 
              checked={selectedMeals.includes('lunch')}
              onChange={() => handleMealSelection('lunch')}
              className={styles.mealCheckbox}
            >
              Lunch
            </Checkbox>
            
            {selectedMeals.includes('lunch') && (
              <Button
                type="text"
                size="small"
                onClick={() => toggleTimePicker('lunch')}
                className={styles.toggleTimeBtn}
              >
                {showTimePickers.lunch ? 'Hide time' : 'Show time'}
              </Button>
            )}
            
            {selectedMeals.includes('lunch') && showTimePickers.lunch && (
              <div className={styles.timePickerGroup}>
                <TimePicker 
                  value={mealTime.lunch.start}
                  format="HH:mm"
                  onChange={(time) => handleStartTimeChange(time, 'lunch')}
                  className={styles.timePicker}
                  placeholder="Start time"
                />
                <span className={styles.timePickerSeparator}>to</span>
                <TimePicker 
                  value={mealTime.lunch.end}
                  format="HH:mm"
                  onChange={(time) => handleEndTimeChange(time, 'lunch')}
                  className={styles.timePicker}
                  placeholder="End time"
                />
              </div>
            )}
          </div>
          
          <div className={styles.mealItems}>
            <Checkbox 
              checked={selectedMeals.includes('dinner')}
              onChange={() => handleMealSelection('dinner')}
              className={styles.mealCheckbox}
            >
              Dinner
            </Checkbox>
            
            {selectedMeals.includes('dinner') && (
              <Button
                type="text"
                size="small"
                onClick={() => toggleTimePicker('dinner')}
                className={styles.toggleTimeBtn}
              >
                {showTimePickers.dinner ? 'Hide time' : 'Show time'}
              </Button>
            )}
            
            {selectedMeals.includes('dinner') && showTimePickers.dinner && (
              <div className={styles.timePickerGroup}>
                <TimePicker 
                  value={mealTime.dinner.start}
                  format="HH:mm"
                  onChange={(time) => handleStartTimeChange(time, 'dinner')}
                  className={styles.timePicker}
                  placeholder="Start time"
                />
                <span className={styles.timePickerSeparator}>to</span>
                <TimePicker 
                  value={mealTime.dinner.end}
                  format="HH:mm"
                  onChange={(time) => handleEndTimeChange(time, 'dinner')}
                  className={styles.timePicker}
                  placeholder="End time"
                />
              </div>
            )}
          </div>
          
          {/* Display custom meal times */}
          {Object.entries(customMeals).map(([mealId, mealDetails]) => (
            <div key={mealId} className={styles.mealItems}>
              <div className={styles.customMealHeader}>
                <Checkbox 
                  checked={selectedMeals.includes(mealId)}
                  onChange={() => handleMealSelection(mealId)}
                  className={styles.mealCheckbox}
                >
                  {mealDetails.name}
                </Checkbox>
                
                <Button 
                  type="text" 
                  icon={<DeleteOutlined />} 
                  onClick={() => removeMealTime(mealId)}
                  className={styles.deleteMealBtn}
                />
              </div>
              
              {selectedMeals.includes(mealId) && (
                <Button
                  type="text"
                  size="small"
                  onClick={() => toggleTimePicker(mealId)}
                  className={styles.toggleTimeBtn}
                >
                  {showTimePickers[mealId] ? 'Hide time' : 'Show time'}
                </Button>
              )}
              
              {selectedMeals.includes(mealId) && showTimePickers[mealId] && (
                <div className={styles.timePickerGroup}>
                  <TimePicker 
                    value={mealTime[mealId]?.start}
                    format="HH:mm"
                    onChange={(time) => handleStartTimeChange(time, mealId)}
                    className={styles.timePicker}
                    placeholder="Start time"
                  />
                  <span className={styles.timePickerSeparator}>to</span>
                  <TimePicker 
                    value={mealTime[mealId]?.end}
                    format="HH:mm"
                    onChange={(time) => handleEndTimeChange(time, mealId)}
                    className={styles.timePicker}
                    placeholder="End time"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Button 
          icon={<PlusOutlined />} 
          type="text"
          className={styles.addMealBtn}
          onClick={showAddMealModal}
        >
          Add Meal Time
        </Button>
      </div>

      <div className={styles.contentArea}>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          className={styles.mealTabs}
        >
          {selectedMeals.includes('breakfast') && (
            <TabPane tab="Breakfast" key="breakfast" className={styles.tabPane}>
              {menuItems.breakfast.map((item, index) => (
                <div key={index} className={styles.menuItem}>
                  <span>{item}</span>
                  <Button 
                    type="text" 
                    icon={<CloseOutlined />} 
                    onClick={() => removeMenuItem(item)}
                    className={styles.removeBtn}
                  />
                </div>
              ))}
            </TabPane>
          )}
          
          {selectedMeals.includes('lunch') && (
            <TabPane tab="Lunch" key="lunch" className={styles.tabPane}>
              {menuItems.lunch.map((item, index) => (
                <div key={index} className={styles.menuItem}>
                  <span>{item}</span>
                  <Button 
                    type="text" 
                    icon={<CloseOutlined />} 
                    onClick={() => removeMenuItem(item)}
                    className={styles.removeBtn}
                  />
                </div>
              ))}
            </TabPane>
          )}
          
          {selectedMeals.includes('dinner') && (
            <TabPane tab="Dinner" key="dinner" className={styles.tabPane}>
              {menuItems.dinner.map((item, index) => (
                <div key={index} className={styles.menuItem}>
                  <span>{item}</span>
                  <Button 
                    type="text" 
                    icon={<CloseOutlined />} 
                    onClick={() => removeMenuItem(item)}
                    className={styles.removeBtn}
                  />
                </div>
              ))}
            </TabPane>
          )}
          
          {/* Render custom meal tabs */}
          {Object.entries(customMeals).map(([mealId, mealDetails]) => 
            selectedMeals.includes(mealId) && (
              <TabPane tab={mealDetails.name} key={mealId} className={styles.tabPane}>
                {menuItems[mealId]?.map((item, index) => (
                  <div key={index} className={styles.menuItem}>
                    <span>{item}</span>
                    <Button 
                      type="text" 
                      icon={<CloseOutlined />} 
                      onClick={() => removeMenuItem(item)}
                      className={styles.removeBtn}
                    />
                  </div>
                ))}
              </TabPane>
            )
          )}
        </Tabs>
      </div>

      <div className={styles.updateBtnContainer}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className={styles.updateBtn}
          onClick={updateMenu}
        >
          Update Menu
        </Button>
      </div>
      
      {/* Add Custom Meal Modal */}
      <Modal
        title="Add Custom Meal Time"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        className={styles.customMealModal}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="mealName"
            label="Meal Name"
            rules={[{ required: true, message: 'Please enter a meal name' }]}
          >
            <Input 
              placeholder="Enter meal name (e.g., Snack, Tea Time)"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
            />
          </Form.Item>
          
          <Form.Item
            name="startTime"
            label="Start Time"
            rules={[{ required: true, message: 'Please select a start time' }]}
          >
            <TimePicker format="HH:mm" className={styles.modalTimePicker} />
          </Form.Item>
          
          <Form.Item
            name="endTime"
            label="End Time"
            rules={[{ required: true, message: 'Please select an end time' }]}
          >
            <TimePicker format="HH:mm" className={styles.modalTimePicker} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MealPlanner;