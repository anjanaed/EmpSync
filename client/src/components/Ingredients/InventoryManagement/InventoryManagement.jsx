import React, { useState, useEffect } from 'react';
import { Input, Button, Card, message, Modal, Form, InputNumber, Select } from 'antd';
import { PlusOutlined, FilePdfOutlined } from '@ant-design/icons';
import IngredientList from './IngredientList/IngredientList';
import styles from './InventoryManagement.module.css';
import axios from 'axios';
import { exportIngredientsToPDF } from '../InventoryManagement/pdfExport/pdfExport';

const { Search } = Input;
const { Option } = Select;

const INGREDIENT_TYPES = [
  'Vegetables',
  'Fruits',
  'Grains & Cereals',
  'Dairy Products',
  'Meat & Poultry',
  'Spices & Condiments',
  'Beverages',
  'Oils & Fats',
  'Bakery & Sweets',
  'Processed & Canned'
];

const InventoryManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addIngredientForm] = Form.useForm();
  const [addingIngredient, setAddingIngredient] = useState(false);

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
    setIsAddModalVisible(true);
  };

  const handleAddModalCancel = () => {
    setIsAddModalVisible(false);
    addIngredientForm.resetFields();
  };

  const handleAddModalSubmit = async () => {
    try {
      const values = await addIngredientForm.validateFields();
      setAddingIngredient(true);
      
      // Format the values to match the expected JSON structure
      const newIngredient = {
        id: values.id,
        name: values.name,
        price_per_unit: values.price_per_unit.toString(),
        quantity: values.quantity.toString(),
        type: values.type,
        priority: values.priority
      };
      
      // Send POST request to add the ingredient
      const response = await axios.post('http://localhost:3000/ingredients', newIngredient);
      
      // Add the new ingredient to the local state
      setIngredients([...ingredients, response.data]);
      
      message.success('Ingredient added successfully');
      setIsAddModalVisible(false);
      addIngredientForm.resetFields();
    } catch (error) {
      console.error('Error adding ingredient:', error);
      message.error('Failed to add ingredient');
    } finally {
      setAddingIngredient(false);
    }
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

  const handleExportPDF = () => {
    const result = exportIngredientsToPDF(filteredIngredients, {
      title: 'Inventory Management - Ingredients List',
      filename: 'ingredients-inventory.pdf'
    });
    
    if (result.success) {
      message.success(result.message);
    } else {
      message.error(result.message);
    }
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
            type="default"
            icon={<FilePdfOutlined />} 
            onClick={handleExportPDF}
            className={styles.exportButton}
            style={{ marginRight: '10px' }}
          >
            Export PDF
          </Button>
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

      {/* Add Ingredient Modal */}
      <Modal
        title="Add New Ingredient"
        visible={isAddModalVisible}
        onCancel={handleAddModalCancel}
        footer={[
          <Button key="cancel" onClick={handleAddModalCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={addingIngredient} 
            onClick={handleAddModalSubmit}
          >
            Add Ingredient
          </Button>,
        ]}
      >
        <Form
          form={addIngredientForm}
          layout="vertical"
          name="addIngredientForm"
        >
          <Form.Item
            name="id"
            label="Ingredient ID"
            rules={[{ required: true, message: 'Please enter ingredient ID' }]}
          >
            <Input placeholder="Enter ingredient ID" />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="Ingredient Name"
            rules={[{ required: true, message: 'Please enter ingredient name' }]}
          >
            <Input placeholder="Enter ingredient name" />
          </Form.Item>
          
          <Form.Item
            name="price_per_unit"
            label="Price Per Unit"
            rules={[{ required: true, message: 'Please enter price per unit' }]}
          >
            <InputNumber 
              min={0}
              step={0.01}
              precision={2}
              style={{ width: '100%' }}
              placeholder="Enter price per unit"
            />
          </Form.Item>
          
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber 
              min={0}
              style={{ width: '100%' }}
              placeholder="Enter quantity"
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select ingredient type' }]}
          >
            <Select placeholder="Select ingredient type">
              {INGREDIENT_TYPES.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
            initialValue={3}
          >
            <Select placeholder="Select priority">
              <Option value={1}>High</Option>
              <Option value={2}>Medium</Option>
              <Option value={3}>Low</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryManagement;