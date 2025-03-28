import React, { useState, useEffect } from 'react';
import { Input, Button, Card, message, Modal } from 'antd'; // Add Modal import
import { PlusOutlined } from '@ant-design/icons';
import IngredientList from './IngredientList/IngredientList';
import styles from './InventoryManagement.module.css';
import axios from 'axios';

const { Search } = Input;

const InventoryManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch ingredients from the API
  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/ingredients');
      setIngredients(response.data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      message.error('Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleAddIngredient = () => {
    // This would typically open a modal for adding a new ingredient
    console.log('Add ingredient clicked');
  };

  const handleEditIngredient = (id) => {
    console.log('Edit ingredient', id);
  };

  const handleDeleteIngredient = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this ingredient?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3000/ingredients/${id}`);
          
          // For now, just filter locally
          setIngredients(ingredients.filter(ingredient => ingredient.id !== id));
          message.success('Ingredient deleted successfully');
        } catch (error) {
          console.error('Error deleting ingredient:', error);
          message.error('Failed to delete ingredient');
        }
      },
    });
  };

  const filteredIngredients = ingredients.filter(ingredient => 
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Inventory Management</h1>
          <p className={styles.subtitle}>Manage your ingredients and supplies</p>
        </div>
        <div className={styles.actions}>
          <Search 
            placeholder="Search ingredients..." 
            onSearch={handleSearch} 
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.search} 
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddIngredient}
            className={styles.addButton}
          >
            Add Ingredient
          </Button>
        </div>
      </div>
      
      <Card className={styles.card} loading={loading}>
        <IngredientList 
          ingredients={filteredIngredients} 
          onEdit={handleEditIngredient} 
          onDelete={handleDeleteIngredient} 
        />
      </Card>
    </div>
  );
};

export default InventoryManagement;