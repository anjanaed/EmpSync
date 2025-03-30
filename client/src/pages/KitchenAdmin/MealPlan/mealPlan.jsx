import React, { useState } from 'react';
import { Layout, Card, Input, Button, Checkbox, Space, Row, Col } from 'antd';
// import Header from '../../../components/KitchenAdmin/MealDetails/Header';
import styles from './mealPlan.module.css';

const MealPlan = () => {
  const [selectedMeals, setSelectedMeals] = useState([
    { name: 'Rice & Curry', checked: true },
    { name: 'Noodles', checked: false },
    { name: 'Noodles', checked: false },
    { name: 'Noodles', checked: false },
    { name: 'Noodles', checked: false },
    { name: 'Noodles', checked: false },
    { name: 'Noodles', checked: false },
    { name: 'Noodles', checked: false },
    { name: 'Noodles', checked: false },
    { name: 'Noodles', checked: false },
    { name: 'Noodles', checked: false },
    { name: 'Noodles', checked: false },
    { name: 'Hoppers', checked: true },
  ]);

  const [searchText, setSearchText] = useState('');

  const handleMealToggle = (index) => {
    const updatedMeals = [...selectedMeals];
    updatedMeals[index].checked = !updatedMeals[index].checked;
    setSelectedMeals(updatedMeals);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredMeals = selectedMeals.filter((meal) =>
    meal.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Layout className={styles.container}>
      

      {/* Main Content */}
      <Layout.Content className={styles.contentContainer}>
        <Card className={styles.mainCard}>
          <h3 className={styles.cardTitle}>Update Meal Plan</h3>

          <Card className={styles.innerCard}>
            <h3 className={styles.innerCardTitle}>Available Meals</h3>

            {/* Search Input */}
            <Row className={styles.searchRow}>
              <Col className={styles.searchInputCol}>
                <Input
                  placeholder="Search meals"
                  className={styles.searchInput}
                  value={searchText}
                  onChange={handleSearch}
                />
              </Col>
              <Col className={styles.searchButtonCol}>
                <Button type="primary" className={styles.searchButton}>
                  Search
                </Button>
              </Col>
            </Row>

            {/* Filtered Meals List */}
            <div className={styles.mealListContainer}>
              <div className={styles.mealList}>
                {filteredMeals.map((meal, index) => (
                  <div
                    key={index}
                    className={`${styles.mealItem} ${
                      index < filteredMeals.length - 1 ? styles.mealItemBorder : ''
                    }`}
                  >
                    <span className={styles.mealName}>{meal.name}</span>
                    <Checkbox
                      className={styles.checkbox}
                      checked={meal.checked}
                      onChange={() => handleMealToggle(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Footer Buttons */}
          <Row className={styles.footerButtons}>
            <Space>
              <Button className={styles.cancelButton}>Cancel</Button>
              <Button type="primary" className={styles.updateButton}>Update</Button>
            </Space>
          </Row>
        </Card>
      </Layout.Content>
    </Layout>
  );
};

export default MealPlan;
