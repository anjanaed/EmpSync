import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  Modal, 
  List,
  message
} from 'antd';
import { 
  DeleteOutlined, 
  EditOutlined, 
  PlusOutlined, 
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

import styles from './meals.module.css';

const { Title } = Typography;
const { Search } = Input;
const { confirm } = Modal;

const AvailableMeals = () => {
  const [meals, setMeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ingredientsModalVisible, setIngredientsModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Fetch meal data from the API
  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await fetch('http://localhost:3000/meal');
      const data = await response.json();
      setMeals(data);
    } catch (error) {
      console.error("Error fetching meals:", error);
      message.error("Failed to load meals");
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const showDeleteConfirm = (meal) => {
    confirm({
      title: 'Are you sure you want to delete this meal?',
      icon: <ExclamationCircleOutlined />,
      content: `Meal ID: ${meal.id}`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteMeal(meal.id);
      },
    });
  };

  const deleteMeal = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/meal/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies/auth headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete meal');
      }

      // Remove meal from state if deletion was successful
      setMeals(meals.filter(meal => meal.id !== id));
      message.success('Meal deleted successfully');
    } catch (error) {
      console.error('Error deleting meal:', error);
      message.error(`Failed to delete meal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meal) => {
    navigate('/edit-meal', { state: { meal } });
  };
  
  // Function to show ingredients modal
  const showIngredientsModal = (meal) => {
    setSelectedMeal(meal);
    setIngredientsModalVisible(true);
  };

  const closeIngredientsModal = () => {
    setIngredientsModalVisible(false);
    setSelectedMeal(null);
  };

  const filteredMeals = searchTerm 
    ? meals.filter(meal => meal.nameEnglish.toLowerCase().includes(searchTerm.toLowerCase()))
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
            onClick={() => navigate("/meal-details")}
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
            >
              <div className={styles.imageContainer}>
                {meal.imageUrl ? (
                  <div className={styles.imageWrapper}>
                    <img src={meal.imageUrl} alt={meal.nameEnglish} className={styles.mealImage} />
                  </div>
                ) : (
                  <div className={styles.imagePlaceholder}></div>
                )}
              </div>
              
              <div className={styles.mealInfo}>
                <Title level={5} className={styles.mealTitle}>{meal.nameEnglish}</Title>
                <label className={styles.mealDetails}>Meal Id: {meal.id}</label><br/>
                <label className={styles.mealDetails}>Price: {meal.price}</label><br/>
                <label 
                  className={styles.mealDetails} 
                  onClick={() => showIngredientsModal(meal)}
                  style={{ cursor: 'pointer' }}
                >
                  Ingredients <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ marginLeft: '4px' }} />
                </label>
              </div>

              <div className={styles.mealActions}>
                <Button 
                  type="text" 
                  danger
                  icon={<DeleteOutlined />} 
                  onClick={() => showDeleteConfirm(meal)}
                  loading={loading}
                >
                  Delete
                </Button>
                <Button 
                  type="text"
                  icon={<EditOutlined />} 
                  onClick={() => handleEdit(meal)}
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
        title={selectedMeal ? `${selectedMeal.nameEnglish} Ingredients` : 'Ingredients'}
        open={ingredientsModalVisible}
        onCancel={closeIngredientsModal}
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
            dataSource={selectedMeal.ingredients || ['No ingredients available']}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={item.name ? `${item.name} - ${item.quantity}g` : item}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default AvailableMeals;