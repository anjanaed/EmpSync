import React, { useState } from 'react';
import { DatePicker, Button, Checkbox, TimePicker, Tabs } from 'antd';
import { PlusOutlined, CloseOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './Calendar.module.css';

const { TabPane } = Tabs;

const MealPlanner = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedMeals, setSelectedMeals] = useState(['breakfast']);
  const [mealTime, setMealTime] = useState({
    breakfast: dayjs('07:30', 'HH:mm'),
    lunch: null,
    dinner: null,
  });
  const [activeTab, setActiveTab] = useState('breakfast');
  const [menuItems, setMenuItems] = useState({
    breakfast: ['Milk Rice', 'Peas', 'Hoppers', 'Noodles'],
    lunch: [],
    dinner: [],
  });

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

  const handleTimeChange = (time, meal) => {
    setMealTime({
      ...mealTime,
      [meal]: time,
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

  const addMealTime = () => {
    // Logic to add custom meal time
    console.log("Add meal time clicked");
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
        <Checkbox 
          checked={selectedMeals.includes('breakfast')}
          onChange={() => handleMealSelection('breakfast')}
          className={styles.mealCheckbox}
        >
          Breakfast
        </Checkbox>
        
        {selectedMeals.includes('breakfast') && (
          <TimePicker 
            value={mealTime.breakfast}
            format="HH:mm"
            onChange={(time) => handleTimeChange(time, 'breakfast')}
            className={styles.timePicker}
          />
        )}
        
        <Checkbox 
          checked={selectedMeals.includes('lunch')}
          onChange={() => handleMealSelection('lunch')}
          className={styles.mealCheckbox}
        >
          Lunch
        </Checkbox>
        
        {selectedMeals.includes('lunch') && (
          <TimePicker 
            value={mealTime.lunch}
            format="HH:mm"
            onChange={(time) => handleTimeChange(time, 'lunch')}
            className={styles.timePicker}
          />
        )}
        
        <Checkbox 
          checked={selectedMeals.includes('dinner')}
          onChange={() => handleMealSelection('dinner')}
          className={styles.mealCheckbox}
        >
          Dinner
        </Checkbox>
        
        {selectedMeals.includes('dinner') && (
          <TimePicker 
            value={mealTime.dinner}
            format="HH:mm"
            onChange={(time) => handleTimeChange(time, 'dinner')}
            className={styles.timePicker}
          />
        )}
        
        <Button 
          icon={<PlusOutlined />} 
          type="text"
          className={styles.addMealBtn}
          onClick={addMealTime}
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
    </div>
  );
};

export default MealPlanner;