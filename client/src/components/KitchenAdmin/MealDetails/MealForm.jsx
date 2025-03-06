import React, { useState } from 'react';
import { Form, Input, Button, Modal, Checkbox, Card, ConfigProvider } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './MealForm.module.css';

const { TextArea } = Input;

const MealForm = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ingredients, setIngredients] = useState([
    { name: 'Rice', isSelected: false, amount: '' },
    { name: 'Tomato', isSelected: false, amount: '' },
    // Add more ingredients as needed
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
          colorPrimary: '#800020',
        },
      }}
    >
      <div>
        <Form.Item
          label={<span>Name <span style={{ color: '#ff4d4f' }}>*</span></span>}
          name="name"
          rules={[{ required: true, message: 'Please input the meal name!' }]}
          help="Please input the meal name!"
          style={{ marginBottom: '24px' }}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={<span>Price <span style={{ color: '#ff4d4f' }}>*</span></span>}
          name="price"
          rules={[{ required: true, message: 'Please input the price!' }]}
          help="Please input the price!"
          style={{ marginBottom: '24px' }}
        >
          <Input prefix="Rs." />
        </Form.Item>

        <Form.Item
          label={<span>Description <span style={{ color: '#ff4d4f' }}>*</span></span>}
          name="description"
          rules={[{ required: true, message: 'Please input the description!' }]}
          help="Please input the description!"
          style={{ marginBottom: '24px' }}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Button 
          block 
          style={{ 
            backgroundColor: '#800020',
            color: 'white'
          }}
          onClick={() => setIsModalVisible(true)}
        >
          Choose Ingredients
        </Button>

        <Modal
          title="Select Ingredients"
          open={isModalVisible}
          onOk={() => setIsModalVisible(false)}
          onCancel={() => setIsModalVisible(false)}
          width={800}
          footer={[
            <Button key="cancel" onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>,
            <Button 
              key="confirm" 
              type="primary" 
              onClick={() => setIsModalVisible(false)}
              style={{ backgroundColor: '#800020' }}
            >
              Confirm
            </Button>
          ]}
        >
          <Input 
            placeholder="Search ingredients" 
            onChange={handleSearch}
            style={{ marginBottom: '16px' }}
          />
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {filteredIngredients.map((ingredient, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '16px' }}>
                <Input 
                  value={ingredient.name} 
                  readOnly 
                  style={{ flex: 1 }}
                />
                <Checkbox 
                  checked={ingredient.isSelected}
                  onChange={() => handleCheckboxChange(index)}
                />
                {ingredient.isSelected && (
                  <Input 
                    value={ingredient.amount}
                    onChange={(e) => handleAmountChange(index, e.target.value)}
                    placeholder="Amount in grams"
                    style={{ width: '120px' }}
                  />
                )}
              </div>
            ))}
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default MealForm;