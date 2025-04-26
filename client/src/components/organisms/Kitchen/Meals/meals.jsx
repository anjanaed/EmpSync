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
  message,
  Select,
  Tag,
  Spin
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
// Import Firebase storage related functions
import { getStorage, ref, deleteObject } from "firebase/storage";

import styles from './meals.module.css';

const { Title } = Typography;
const { Search } = Input;
const { confirm } = Modal;
const { Option } = Select;

const AvailableMeals = () => {
  const [meals, setMeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [ingredientsModalVisible, setIngredientsModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ingredientDetails, setIngredientDetails] = useState({});
  const [fetchingIngredients, setFetchingIngredients] = useState(false);
  
  // Initialize Firebase storage
  const storage = getStorage();
  
  const navigate = useNavigate();

  // Fetch meal data from the API
  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/meal');
      const data = await response.json();
      setMeals(data);
    } catch (error) {
      console.error("Error fetching meals:", error);
      message.error("Failed to load meals");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
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
        deleteMeal(meal);
      },
    });
  };

  // Delete image from Firebase Storage
  const deleteImageFromFirebase = async (imageUrl) => {
    if (!imageUrl) return true; // No image to delete
    
    try {
      // Extract the file path from the URL
      // This assumes your imageUrl is in a Firebase Storage format
      // Example: https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/meals%2Fimage1.jpg?alt=media&token=abc123
      const urlPath = decodeURIComponent(imageUrl.split('/o/')[1]?.split('?')[0]);
      
      if (!urlPath) {
        console.warn("Could not parse image URL for deletion:", imageUrl);
        return false;
      }
      
      // Create a reference to the file to delete
      const imageRef = ref(storage, urlPath);
      
      // Delete the file
      await deleteObject(imageRef);
      console.log("Image successfully deleted from Firebase Storage");
      return true;
    } catch (error) {
      console.error("Error deleting image from Firebase:", error);
      return false;
    }
  };

  const deleteMeal = async (meal) => {
    setLoading(true);
    try {
      // First try to delete the image from Firebase Storage if it exists
      if (meal.imageUrl) {
        const imageDeleted = await deleteImageFromFirebase(meal.imageUrl);
        if (!imageDeleted) {
          message.warning('Could not delete the associated image, but will proceed with meal deletion');
        }
      }

      // Then delete the meal from the database
      const response = await fetch(`http://localhost:3000/meal/${meal.id}`, {
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
      setMeals(meals.filter(m => m.id !== meal.id));
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
  
  // Fetch ingredient details by ID
  const fetchIngredientDetails = async (ingredientId) => {
    try {
      const response = await fetch(`http://localhost:3000/Ingredients/${ingredientId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ingredient ${ingredientId}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ingredient ${ingredientId}:`, error);
      return null;
    }
  };

  // Function to show ingredients modal and fetch ingredient details
  const showIngredientsModal = async (meal) => {
    setSelectedMeal(meal);
    setIngredientsModalVisible(true);
    setFetchingIngredients(true);
    
    const ingredientIds = [];
    // Extract ingredient IDs from the ingredients array
    if (meal.ingredients && meal.ingredients.length > 0) {
      meal.ingredients.forEach(item => {
        if (typeof item === 'string' && item.includes(':')) {
          const [id] = item.split(':');
          ingredientIds.push(id);
        }
      });
    }
    
    // Fetch details for all ingredients
    if (ingredientIds.length > 0) {
      const detailsMap = {};
      
      try {
        // Fetch details for each ingredient
        const promises = ingredientIds.map(id => fetchIngredientDetails(id));
        const results = await Promise.all(promises);
        
        // Map the results to ingredient IDs
        ingredientIds.forEach((id, index) => {
          detailsMap[id] = results[index];
        });
        
        setIngredientDetails(detailsMap);
      } catch (error) {
        console.error("Error fetching ingredient details:", error);
        message.error("Failed to load ingredient details");
      }
    }
    
    setFetchingIngredients(false);
  };

  const closeIngredientsModal = () => {
    setIngredientsModalVisible(false);
    setSelectedMeal(null);
    setIngredientDetails({});
  };

  // Filter meals based on search term and selected category
  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.nameEnglish.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if the meal matches the selected category
    let matchesCategory;
    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else {
      // Handle both string and array category formats
      if (Array.isArray(meal.category)) {
        matchesCategory = meal.category.includes(selectedCategory);
      } else {
        matchesCategory = meal.category === selectedCategory;
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  // Fixed category options
  const categoryOptions = ['All', 'Breakfast', 'Lunch', 'Dinner'];

  // Function to render category tags
  const renderCategoryTags = (categories) => {
    if (!categories) return <Tag color="blue">Uncategorized</Tag>;
    
    // Handle both string and array formats
    if (Array.isArray(categories)) {
      if (categories.length === 0) {
        return <Tag color="blue" className={styles.tag}>Uncategorized</Tag>;
      } else {
        // Join all categories into a single tag with separator
        return (
          <Tag color="blue" className={styles.tag}>
            {categories.join(' / ')}
          </Tag>
        );
      }
    } else {
      return <Tag color="blue" className={styles.tag}>{categories}</Tag>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title level={3} className={styles.title}>Available Meals</Title>
        </div>
      </div>
      
      <div className={styles.filterContainer}>
        <Search
          placeholder="Search meals..."
          allowClear
          onSearch={handleSearch}
          className={styles.searchInput}
          size="large"
        />
        
        <Select
          defaultValue="All"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className={styles.categorySelect}
          size="large"
        >
          {categoryOptions.map(category => (
            <Option key={category} value={category}>{category}</Option>
          ))}
        </Select>
        
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '10px' }}>Loading meals...</p>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredMeals.length === 0 ? (
            <Col span={24}>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>No meals found matching your criteria.</p>
              </div>
            </Col>
          ) : (
            filteredMeals.map(meal => (
              <Col xs={24} sm={12} md={4} key={meal.id}>
                <Card className={styles.card}>
                  <div className={styles.categoryTag}>
                    {renderCategoryTags(meal.category)}
                  </div>
                  
                  <div className={styles.imageContainer}>
                    {meal.imageUrl ? (
                      <div className={styles.imageWrapper}>
                        <img src={meal.imageUrl} alt={meal.nameEnglish} className={styles.mealImage} />
                      </div>
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <span className={styles.imageIcon}>🖼️</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.mealInfo}>
                    <Title level={5} className={styles.mealTitle}>{meal.nameEnglish}</Title>
                    <div className={styles.mealDetails}>
                      <div>ID: <span className={styles.idValue}>{meal.id}</span></div>
                      <div>Price: <span className={styles.priceValue}>Rs.{meal.price?.toFixed(2)}</span></div>
                      <div 
                        className={styles.ingredientsLink} 
                        onClick={() => showIngredientsModal(meal)}
                      >
                        Ingredients <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ marginLeft: '4px' }} />
                      </div>
                    </div>
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
            ))
          )}
        </Row>
      )}

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
        {fetchingIngredients ? (
          <div className={styles.loadingContainer} style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '10px' }}>Loading ingredients...</p>
          </div>
        ) : (
          selectedMeal && (
            <List
              dataSource={selectedMeal.ingredients || ["No ingredients available"]}
              renderItem={(item) => {
                // Check if item is a string in "id:quantity" format
                if (typeof item === "string" && item.includes(":")) {
                  const [id, quantity] = item.split(":");
                  const ingredientData = ingredientDetails[id];
                  
                  return (
                    <List.Item>
                      <List.Item.Meta 
                        title={
                          <div className={styles.ingredientItem}>
                            <span className={styles.ingredientName} >
                              {ingredientData ? ingredientData.name : id}
                            </span>
                            <span className={styles.ingredientQuantity}>
                              : {quantity}g
                            </span>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                } else {
                  // If item doesn't match expected format, display as is
                  return (
                    <List.Item>
                      <List.Item.Meta title={item} />
                    </List.Item>
                  );
                }
              }}
            />
          )
        )}
      </Modal>
    </div>
  );
};

export default AvailableMeals;