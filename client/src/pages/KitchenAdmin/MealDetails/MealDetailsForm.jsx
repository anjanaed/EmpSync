import React, { useState } from 'react';
import { Form, Typography, Layout } from 'antd';
import Header from '../../../components/KitchenAdmin/MealDetails/Header';
import ImageUpload from '../../../components/KitchenAdmin/MealDetails/ImageUpload';
import MealForm from '../../../components/KitchenAdmin/MealDetails/MealForm';
import FormFooter from '../../../components/KitchenAdmin/MealDetails/FormFooter';

const { Content } = Layout;
const { Title } = Typography;

const MealDetailsForm = () => {
  const [imageUrl, setImageUrl] = useState('');

  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#fff5e6' }}>
      <Header />
      <Content style={{ 
        padding: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        <div style={{ 
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '1000px'
        }}>
          <Title level={2} style={{ marginBottom: '32px' }}>Add Meal Details</Title>
          
          <Form
            layout="vertical"
            onFinish={onFinish}
          >
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '250px 1fr',
              gap: '32px',
              marginBottom: '24px'
            }}>
              <ImageUpload imageUrl={imageUrl} setImageUrl={setImageUrl} />
              <MealForm />
            </div>
            <FormFooter />
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default MealDetailsForm;