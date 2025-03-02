
import React, { useState } from 'react';
import { Button, Input, Checkbox, Card, Typography, ConfigProvider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Nav from '../../../components/KitchenAdmin/Ingredients/navbar';
import styles from './ingredient.module.css';



const { Title } = Typography;

const SelectIngredient= () => {
  const [ingredients, setIngredients] = useState([
    { name: 'Rice', isSelected: false, amount: '' },
    { name: 'Tomato', isSelected: true, amount: '100g' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Oil', isSelected: false, amount: '' },
    { name: 'Dhal', isSelected: true, amount: '1000g' }
    

  ]);
  
  const [searchText, setSearchText] = useState('');

  const handleCheckboxChange = (index) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index].isSelected = !updatedIngredients[index].isSelected;
    setIngredients(updatedIngredients);
  };

  const handleAmountChange = (index, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index].amount = value;
    setIngredients(updatedIngredients);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredIngredients = ingredients.filter(ingredient => 
    ingredient.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
 <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#6b0f1a',
        colorPrimaryHover: '#8b1a27',
        colorBorder: '#d9d9d9',
        colorPrimaryBorder: '#6b0f1a',
      },
      components: {
        Checkbox: {
          colorPrimary: '#6b0f1a',
        },
        Input: {
          activeBorderColor: '#6b0f1a',
          hoverBorderColor: '#6b0f1a',
          activeShadow: '0 0 0 2px rgba(107, 15, 26, 0.2)',
        }
      }
    }}
  >
    <div className={styles.container}>
      <Nav/>

      <div className={styles.content}>
        <Card className={styles.card}>
          <Title level={3}>Select Ingredients</Title>
          
          <div className={styles.ingredientsSection}>
            <Title level={4}>Available Ingredients</Title>
            
            <Input 
              placeholder="Search ingredients" 
              onChange={handleSearch}
              className={styles.searchInput}
            />
            
            <Card className={styles.ingredientsList}>
              {filteredIngredients.map((ingredient, index) => (
                <div key={index} className={styles.ingredientRow}>
                  <Input 
                    value={ingredient.name} 
                    readOnly 
                    className={styles.ingredientInput}
                  />
                  <Checkbox 
                    checked={ingredient.isSelected}
                    onChange={() => handleCheckboxChange(index)}
                    className={styles.checkbox}
                  />
                  {ingredient.isSelected && (
                    <Input 
                      value={ingredient.amount}
                      onChange={(e) => handleAmountChange(index, e.target.value)}
                      className={styles.amountInput}
                      placeholder="Amount in grams"
                    />
                  )}
                </div>
              ))}
              
            </Card>

            <div className={styles.buttonContainer}>
            <Button 
              type="primary" 
              
              className={styles.confirmButton}
            >
              Confirm
            </Button>
          </div>
          </div>
        </Card>
      </div>
    </div>
    </ConfigProvider>
  );
};

export default SelectIngredient;








