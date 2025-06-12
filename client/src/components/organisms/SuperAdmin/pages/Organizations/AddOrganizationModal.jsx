import { Modal, Form, Input, Button } from 'antd';
import styles from './AddOrganizationModal.module.css';

const AddOrganizationModal = ({ visible, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onSubmit(values);
    form.resetFields();
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
        <Form.Item name="domain" label="Domain" rules={[{ required: true, message: 'Please enter domain' }]}>
          <Input placeholder="Enter domain (e.g., company.com)" />
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