import React from "react";
import { Button, Form, Input, Select, Radio, DatePicker } from "antd";
import { PencilIcon, UserIcon } from "lucide-react";
import moment from "moment";
import styles from "./Userprofile.module.css";

export default function UserProfile() {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    console.log("Form Values:", values);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <div className={styles.badge}>KITCHEN_STAFF</div>
        <Button type="primary" icon={<PencilIcon size={16} />} className={styles.editButton}>
          Edit Profile
        </Button>
      </div>
      <div className={styles.infoCard}>
        <div className={styles.avatar}>
          <UserIcon size={48} aria-label="User Avatar" />
        </div>
        <div className={styles.infoDetails}>
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>Employee ID</div>
            <div className={styles.infoValue}>E999</div>
          </div>
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>Email</div>
            <div className={styles.infoValue}>ganguleldishma@gmail.com</div>
          </div>
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>Job Role</div>
            <div className={styles.infoValue}>KITCHEN_STAFF</div>
          </div>
          <div className={styles.infoGroup}>
            <div className={styles.infoLabel}>Join Date</div>
            <div className={styles.infoValue}>2025-05-08</div>
          </div>
        </div>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className={styles.formGrid}
        initialValues={{
          fullName: "Dishma Gangulel",
          password: "••••••••••",
          phoneNumber: "0726016098",
          birthday: moment("2025-05-08"),
          preferredLanguage: "English",
          height: "56",
          weight: "89",
          gender: "Female",
          address: "55A,gallella,ratnapura",
        }}
      >
        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[{ required: true, message: "Full Name is required" }]}
        >
          <Input className={styles.inputSmall} />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Password is required" }]}
        >
          <Input.Password className={styles.inputSmall} />
        </Form.Item>
        <Form.Item
          label="Phone Number"
          name="phoneNumber"
          rules={[{ required: true, message: "Phone Number is required" }]}
        >
          <Input className={styles.inputSmall} />
        </Form.Item>
        <Form.Item label="Birthday" name="birthday">
          <DatePicker className={styles.input} />
        </Form.Item>
        <Form.Item label="Preferred Language" name="preferredLanguage">
          <Select>
            <Select.Option key="English" value="English">English</Select.Option>
            <Select.Option value="Spanish">Spanish</Select.Option>
            <Select.Option value="French">French</Select.Option>
            <Select.Option value="German">German</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Height (cm)" name="height">
          <Input className={styles.inputSmall} />
        </Form.Item>
        <Form.Item label="Weight (kg)" name="weight">
          <Input className={styles.inputSmall} />
        </Form.Item>
        <Form.Item label="Gender" name="gender">
          <Radio.Group>
            <Radio value="Male">Male</Radio>
            <Radio value="Female">Female</Radio>
            <Radio value="Other">Other</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Address" name="address">
          <Input className={styles.inputSmall} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}