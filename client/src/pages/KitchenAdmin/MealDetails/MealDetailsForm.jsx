// AddMealPage.jsx
import React, { useState, useRef } from 'react';
import { Form, Input, Button, Card, Row, Col, Typography, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Navbar from "../../../components/KitchenAdmin/header/header";
import styles from './MealDetailsForm.module.css';
import { useNavigate } from "react-router-dom";


const { TextArea } = Input;
const { Title } = Typography;

const AddMealPage = () => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // Navigates to the Reports page
  };
  
  // const handleBackClick = () => {
  //   // Navigation logic to go back
  //   console.log('Back button clicked');
  //   // navigate(-1) or history.goBack()
  // };
  
  const handleCancel = () => {
    form.resetFields();
    setImageUrl(null);
    console.log('Form canceled');
    // Navigate away: navigate('/meals')
  };
  
  const handleSubmit = (values) => {
    if (!imageUrl) {
      message.warning('Please select an image for the meal');
      return;
    }
    
    const formData = {
      ...values,
      image: imageUrl
    };
    
    console.log('Form submitted:', formData);
    // API call to save the meal
    // Then navigate: navigate('/meals')
  };
  
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      message.error('You can only upload image files!');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Using your existing Navbar component */}
      <Navbar 
        title="Add Meal" 
        onBackClick={handleBackClick} 
      />
      
      <div className={styles.contentWrapper}>
        <Card className={styles.formCard}>
          <Title level={4} className={styles.cardTitle}>Add Meal Details</Title>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={24}>
              <Col xs={24} md={10}>
                <div className={styles.imageContainer}>
                  <div 
                    className={styles.imagePlaceholder} 
                    onClick={handleImageClick}
                    style={{
                      backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {!imageUrl && (
                      <div className={styles.uploadHint}>
                        <UploadOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                        <p>Click to select an image</p>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <Button 
                  icon={<UploadOutlined />} 
                  className={styles.chooseImageButton}
                  onClick={handleImageClick}
                  block
                >
                  Choose Image
                </Button>
              </Col>
              
              <Col xs={24} md={14}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: 'Please enter meal name' }]}
                >
                  <Input placeholder="Enter meal name" />
                </Form.Item>
                
                <Form.Item
                  label="Price"
                  name="price"
                  rules={[{ required: true, message: 'Please enter price' }]}
                >
                  <Input placeholder="Enter price" />
                </Form.Item>
                
                <Form.Item
                  label="Description"
                  name="description"
                >
                  <TextArea 
                    placeholder="Enter meal description" 
                    rows={4} 
                  />
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    block 
                    className={styles.ingredientsButton}
                  >
                    Choose Ingredients
                  </Button>
                </Form.Item>
              </Col>
            </Row>
            
            <Row className={styles.actionButtonsRow}>
              <Col span={12} className={styles.cancelButtonCol}>
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
              </Col>
              <Col span={12} className={styles.confirmButtonCol}>
                <Button 
                  type="primary" 
                  htmlType="submit"
                >
                  Confirm
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AddMealPage;