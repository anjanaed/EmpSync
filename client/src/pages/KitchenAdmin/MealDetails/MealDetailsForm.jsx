// MealDetailsForm.jsx
import React, { useState } from 'react';
import { Form, Typography, Layout, Button } from 'antd';
import Header from '../../../components/KitchenAdmin/MealDetails/Header';
import ImageUpload from '../../../components/KitchenAdmin/MealDetails/ImageUpload';
import MealForm from '../../../components/KitchenAdmin/MealDetails/MealForm';
import styles from './MealDetailsForm.module.css';
import axios from "axios"; 

const { Content } = Layout;
const { Title } = Typography;

const MealDetailsForm = () => {
  const [imageUrl, setImageUrl] = useState('');
  
  const onFinish = async (values) => {
    const requestData = {
      name: values.name,
      price: values.price,
      description: values.description,
    };

    try {
      const response = await axios.post('http://localhost:5000/meal', requestData);

      if (response.status === 201) {
        console.log('Meal added successfully:', response.data);
        // You can redirect or handle successful meal creation here
      } else {
        console.error('Failed to submit meal');
      }

    } catch (error) {
      console.error('Error submitting meal:', error);
    }
  };

  return (
    <Layout className={styles.container}>
      <Header />
      <Content className={styles.content}>
        <div className={styles.formContainer}>
          <Title level={2} className={styles.title}>Add Meal Details</Title>
          
          <Form
            layout="vertical"
            onFinish={onFinish}
            initialValues={{}}
          >
            <div className={styles.formLayout}>
              <ImageUpload imageUrl={imageUrl} setImageUrl={setImageUrl} />
              <MealForm />
            </div>
            <div style={{ 
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '16px',
                marginTop: '32px'
              }}>
                <Button>Cancel</Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  style={{ backgroundColor: '#800020' }}
                >
                  Confirm
                </Button>
              </div>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default MealDetailsForm;
