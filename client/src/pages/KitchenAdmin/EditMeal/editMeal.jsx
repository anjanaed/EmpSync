import React, { useState } from 'react';
import { Form, Typography, Layout } from 'antd';
import Header from '../../../components/KitchenAdmin/MealDetails/Header';
import ImageUpload from '../../../components/KitchenAdmin/MealDetails/ImageUpload';
import MealForm from '../../../components/KitchenAdmin/MealDetails/MealForm';
import FormFooter from '../../../components/KitchenAdmin/MealDetails/FormFooter';
import styles from './editMeal.module.css';

const { Content } = Layout;
const { Title } = Typography;

const EditMeal = () => {
  const [imageUrl, setImageUrl] = useState('');

  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  return (
    <Layout className={styles.container}>
      <Header />
      <Content className={styles.content}>
        <div className={styles.formContainer}>
          <Title level={2} className={styles.title}>Edit Meal Details</Title>
          
          <Form
            layout="vertical"
            onFinish={onFinish}
          >
            <div className={styles.formLayout}>
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

export default EditMeal;
