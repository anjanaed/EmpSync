import { useState } from 'react';
import { Modal, Form, Input, Button, Switch, InputNumber } from 'antd';
import styles from './AddOrganizationModal.module.css';

const AddOrganizationModal = ({ visible, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await onSubmit(values, () => form.resetFields());
    } catch (err) {
    // optional: handle error or show message
    } finally {
      setLoading(false); // turn off loading in all cases
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Add New Organization"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      className={styles.modal}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical" className={styles.form}>
        <Form.Item name="name" label="Organization Name" rules={[{ required: true, message: 'Please enter organization name' }]}>
          <Input placeholder="Enter organization name" />
        </Form.Item>
        
        <Form.Item 
          name="contactEmail" 
          label="Contact Email" 
          rules={[
            { required: true, message: 'Please enter contact email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input placeholder="Enter contact email" />
        </Form.Item>
        
        <Form.Item
          name="contactNumber"
          label="Contact Number"
          rules={[
            { required: true, message: 'Please enter contact number' },
            { pattern: /^[0-9+]{9,15}$/, message: 'Please enter a valid contact number' },
          ]}
        >
          <Input placeholder="Enter contact number (e.g., +94112223344)" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Please enter address' }]}
        >
          <Input.TextArea rows={3} placeholder="Enter organization address" />
        </Form.Item>
        
        <Form.Item>
          <div className={styles.buttonGroup}>
            <Button type="primary" htmlType="submit"  loading={loading} className={styles.submitButton}>
              Add Organization
            </Button>
            <Button onClick={handleCancel} className={styles.cancelButton}>
              Cancel
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddOrganizationModal;