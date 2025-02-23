import React from 'react';
import { Form, Input, Button } from 'antd';

const { TextArea } = Input;

const MealForm = () => (
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
    >
      Choose Ingredients
    </Button>
  </div>
);

export default MealForm;