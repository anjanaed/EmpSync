import React, { useState } from 'react';
import { Calendar } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './calender.module.css';
import { useNavigate } from 'react-router-dom';

const MenuCalendar = () => {
  const navigate = useNavigate(); 

  const addMeal = () => {
    navigate('/meal-details');
  };
  const editMeal = () => {
    navigate('/edit-meal');
  };



  const [selectedDate, setSelectedDate] = useState('Thursday, Feb 17');
  const [meals, setMeals] = useState([
    { id: 1, name: 'Rice & Curry' },
    { id: 2, name: 'Hoppers' },
    { id: 2, name: 'Hoppers' },
    { id: 2, name: 'Hoppers' },
    { id: 2, name: 'Hoppers' },
    { id: 3, name: 'Noodles' }
  ]);

  return (
    <div className={styles.container}>
      {/* Calendar Section */}
      <div className={styles.calendarSection}>
        <div className={styles.selectedDate}>{selectedDate}</div>
        <div className={styles.calendar}>
          <Calendar
            fullscreen={false}
            onSelect={(date) => {
              setSelectedDate(date.format('dddd, MMM D'));
            }}
          />
        </div>
      </div>

      {/* Meals Section */}
      <div className={styles.mealsSection}>
        <h2 className={styles.mealsTitle}>Meals</h2>
        <div className={styles.mealsList}>
          {meals.map((meal) => (
            <div key={meal.id} className={styles.mealItem}>
              <span>{meal.name}</span>
              <div className={styles.mealActions}>
                <button className={styles.iconButton} onClick={editMeal}>
                  <EditOutlined />
                </button>
                <button className={styles.iconButton}>
                  <DeleteOutlined />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button className={styles.addButton} onClick={addMeal}>
          Add new Meal
        </button>
      </div>
    </div>
  );
};

export default MenuCalendar;