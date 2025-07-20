import { Modal, Form, Input, Button, Switch, InputNumber } from 'antd';
import styles from './AddOrganizationModal.module.css';

const AddOrganizationModal = ({ visible, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onSubmit(values, () => form.resetFields());
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
          name="logoUrl" 
          label="Logo URL" 
          rules={[
            { required: true, message: 'Please enter logo URL' },
            { type: 'url', message: 'Please enter a valid URL' }
          ]}
        >
          <Input placeholder="Enter logo URL (e.g., https://example.com/logo.png)" />
        </Form.Item>
        <Form.Item 
          name="fingerprint_capacity" 
          label="Fingerprint Capacity" 
          rules={[{ required: true, message: 'Please enter fingerprint capacity' }]}
        >
          <InputNumber 
            min={1} 
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item 
          name="fingerprint_per_machine" 
          label="Fingerprints per Machine" 
          rules={[{ required: true, message: 'Please enter fingerprints per machine' }]}
        >
          <InputNumber 
            min={1} 
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item>
          <div className={styles.buttonGroup}>
            <Button type="primary" htmlType="submit" className={styles.submitButton}>
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