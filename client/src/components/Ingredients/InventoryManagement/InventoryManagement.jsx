import React, { useState } from 'react';
import { Input, Button, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import IngredientList from './IngredientList/IngredientList';
import styles from './InventoryManagement.module.css';

const { Search } = Input;

const InventoryManagement = () => {
  const [ingredients, setIngredients] = useState([
    { id: 1, name: 'Olive Oil', category: 'Oils', quantity: 8, unit: 'L', status: 'Low Stock' },
    { id: 2, name: 'Salt', category: 'Spices', quantity: 12, unit: 'kg', status: 'In Stock' },
    { id: 3, name: 'Black Pepper', category: 'Spices', quantity: 5, unit: 'kg', status: 'In Stock' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

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

  const handleDeleteIngredient = (id) => {
    setIngredients(ingredients.filter(ingredient => ingredient.id !== id));
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
      
      <Card className={styles.card}>
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