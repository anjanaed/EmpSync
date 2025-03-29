import React, { useState } from 'react';
import { 
  Typography, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  Tag, 
  Space
} from 'antd';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  PlusOutlined, 
  SearchOutlined 
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

import styles from './meals.module.css';

// Import your meal images from assets
import riceImage from "../../../assets/rice.jpg";
import noodlesImage from "../../../assets/noodles.jpg";



const { Title, Text } = Typography;
const { Search } = Input;

const AvailableMeals = () => {
  const [meals, setMeals] = useState([
    { id: 1, name: 'Rice and Curry',price : 100,  image: riceImage },
    { id: 2, name: 'Noodles', price : 100, image: noodlesImage },
    { id: 3, name: 'Hoppers', price : 100, image: riceImage },
    { id: 4, name: 'Pasta', price : 100, image: noodlesImage },
    { id: 5, name: 'String Hoppers',price : 100, image: riceImage },
    { id: 6, name: 'String Hoppers',price : 100, image: riceImage },
    { id: 7, name: 'String Hoppers',price : 100, image: riceImage },
    { id: 8, name: 'String Hoppers',price : 100, image: riceImage },
    { id: 9, name: 'String Hoppers',price : 100, image: riceImage },



  ]);

  const navigate = useNavigate();

  const handleAddMeal = () => {
    navigate("/meal-details"); // Navigates to the Reports page
  };

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleDelete = (id) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  const handleEdit = (id) => {
    // Implement edit functionality
    console.log('Edit meal with id:', id);
  };

//   const handleAddMeal = () => {
//     // Implement add meal functionality
//     console.log('Add new meal');
//   };

  const filteredMeals = searchTerm 
    ? meals.filter(meal => meal.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : meals;

  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title level={2} className={styles.title}>Available Meals</Title>
          
        </div>
        <div className={styles.actions}>
          <Search
            placeholder="Search meals..."
            allowClear
            onSearch={handleSearch}
            className={styles.searchInput}
            prefix={<SearchOutlined />}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddMeal}
            size="large"
            className={styles.redButton}
          >
            Add new meal
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {filteredMeals.map(meal => (
          <Col xs={24} sm={12} md={4} key={meal.id}>
            <Card
              className={styles.card}
              bodyStyle={{ padding: 0 }}
            >
              <div className={styles.imageContainer}>
                {meal.image ? (
                  <div className={styles.imageWrapper}>
                    <img src={meal.image} alt={meal.name} className={styles.mealImage} />
                  </div>
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <div className={styles.imagePlaceholderIcon}>
                      <PlusOutlined />
                    </div>
                  </div>
                )}
                
              </div>
              
              <div className={styles.mealInfo}>
                <Title level={3} className={styles.mealTitle}>{meal.name}</Title>
                <lable className ={styles.mealDetails}>Meal Id : {meal.id}</lable><br/>
                <lable className ={styles.mealDetails}>Price: {meal.price}</lable><br/>
                <lable className ={styles.mealDetails}>See more <FontAwesomeIcon icon={faArrowUpRightFromSquare} /></lable>

                
                
              </div>
              
              <div className={styles.mealActions}>
                <Button 
                  type="text" 
                  danger
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDelete(meal.id)}
                  

                >
                  Delete
                </Button>
                <Button 
                  type="text"
                  icon={<EditOutlined />} 
                  onClick={() => handleEdit(meal.id)}
                >
                  Edit
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AvailableMeals;