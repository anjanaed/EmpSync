import React, { useState } from 'react';
import { 
  Typography, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  Tag, 
  Space,
  Modal,
  List
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

// Add custom styles for the ingredients modal
const modalStyles = {
  ingredientsModal: {
    '& .ant-modal-content': {
      borderRadius: '8px',
      overflow: 'hidden'
    },
    '& .ant-modal-header': {
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      padding: '16px 24px'
    },
    '& .ant-modal-title': {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 600,
      fontSize: '18px'
    },
    '& .ant-modal-body': {
      padding: '24px'
    },
    '& .ant-modal-footer': {
      borderTop: '1px solid #f0f0f0',
      padding: '12px 24px'
    }
  },
  ingredientsList: {
    '& .ant-list-item': {
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0'
    },
    '& .ant-list-item:last-child': {
      borderBottom: 'none'
    }
  },
  closeButton: {
    backgroundColor: 'rgb(224, 0, 0)',
    borderColor: 'rgb(224, 0, 0)',
    color: '#fff'
  }
};

const AvailableMeals = () => {
  // Sample ingredients data for each meal
  const mealIngredients = {
    1: ['Rice', 'Chicken Curry', 'Dhal', 'Papadam', 'Pickle'],
    2: ['Noodles', 'Vegetables', 'Soy Sauce', 'Chili Flakes'],
    3: ['Rice Flour', 'Coconut Milk', 'Salt'],
    4: ['Pasta', 'Tomato Sauce', 'Cheese', 'Basil'],
    5: ['Rice Flour', 'Water', 'Salt'],
    6: ['Rice Flour', 'Water', 'Salt'],
    7: ['Rice Flour', 'Water', 'Salt'],
    8: ['Rice Flour', 'Water', 'Salt'],
    9: ['Rice Flour', 'Water', 'Salt'],
  };

  const [meals, setMeals] = useState([
    { id: 1, name: 'Rice and Curry', price: 100, image: riceImage },
    { id: 2, name: 'Noodles', price: 100, image: noodlesImage },
    { id: 3, name: 'Hoppers', price: 100, image: riceImage },
    { id: 4, name: 'Pasta', price: 100, image: noodlesImage },
    { id: 5, name: 'String Hoppers', price: 100, image: riceImage },
    { id: 6, name: 'String Hoppers', price: 100, image: riceImage },
    { id: 7, name: 'String Hoppers', price: 100, image: riceImage },
    { id: 8, name: 'String Hoppers', price: 100, image: riceImage },
    { id: 9, name: 'String Hoppers', price: 100, image: riceImage },
  ]);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for the ingredients popup
  const [ingredientsModalVisible, setIngredientsModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

  const handleAddMeal = () => {
    navigate("/meal-details");
  };
  
  const handleEdit = () => {
    navigate("/edit-meal");
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleDelete = (id) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };


  // Function to show ingredients popup
  const showIngredientsModal = (meal) => {
    setSelectedMeal(meal);
    setIngredientsModalVisible(true);
  };

  // Function to hide ingredients popup
  const closeIngredientsModal = () => {
    setIngredientsModalVisible(false);
    setSelectedMeal(null);
  };

  const filteredMeals = searchTerm 
    ? meals.filter(meal => meal.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : meals;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title level={3} className={styles.title}>Available Meals</Title>
        </div>
        <div className={styles.actions}>
          <Search
            placeholder="Search meals..."
            allowClear
            onSearch={handleSearch}
            className={styles.searchInput}
            size="large"
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
              styles={{ body: { padding: "0" } }}
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
                <Title level={5} className={styles.mealTitle}>{meal.name}</Title>
                <label className={styles.mealDetails}>Meal Id : {meal.id}</label><br/>
                <label className={styles.mealDetails}>Price: {meal.price}</label><br/>
                <label 
                  className={styles.mealDetails} 
                  onClick={() => showIngredientsModal(meal)}
                  style={{ 
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: 'rgb(158, 153, 153)',
                    fontWeight: 500,
                    transition: 'color 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'rgba(131, 76, 76, 0.8)'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'rgb(158, 153, 153)'}
                >
                  Ingredients <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ marginLeft: '4px' }} />
                </label>
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

      {/* Ingredients Modal */}
      <Modal
        title={selectedMeal ? `${selectedMeal.name} Ingredients` : 'Ingredients'}
        open={ingredientsModalVisible}
        onCancel={closeIngredientsModal}
        className={styles.ingredientsModal}
        footer={[
          <Button 
            key="close" 
            onClick={closeIngredientsModal}
            className={styles.redButton}
          >
            Close
          </Button>
        ]}
        
       
      >
        {selectedMeal && (
          <List
            dataSource={mealIngredients[selectedMeal.id] || ['No ingredients available']}
            renderItem={item => (
              <List.Item style={{
                padding: '12px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <List.Item.Meta
                  title={
                    <div style={{ 
                      
                      fontSize: '16px',
                      display: 'flex',
                      
                    }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                       
                        marginRight: '12px'
                      }}></div>
                      {item}
                    </div>
                  }
                />
              </List.Item>
            )}
            style={{
              maxHeight: '300px',
              overflow: 'auto'
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default AvailableMeals;