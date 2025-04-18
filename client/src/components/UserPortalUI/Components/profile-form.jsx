import { useState } from "react";
import { Form, Input, Button, Card, Avatar, Divider, Typography, message, Select } from "antd";

const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const { Option } = Select;

export function ProfileForm() {
  const [isEditing, setIsEditing] = useState(false);

  // Default values for the form
  const defaultValues = {
    employeeId: "EMP-1234",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    department: "Engineering",
    position: "Senior Developer",
    joinDate: "2020-01-15",
    address: "123 Main St, Anytown, USA",
    height: "175", // in cm
    weight: "70", // in kg
    bio: "Experienced software developer with a passion for creating efficient and user-friendly applications.",
    gender: "Male", // Default gender value
  };

  const [form] = Form.useForm();

  const onSubmit = (values) => {
    message.success("Your profile has been updated successfully.");
    setIsEditing(false);
  };

  return (
    <div style={{ margin: "20px" }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title level={4}>Personal Information</Title>
            <Paragraph type="secondary">View and update your personal information</Paragraph>
          </div>
          <div>
            {!isEditing ? (
              <Button type="primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={() => setIsEditing(false)} style={{ marginRight: "8px" }}>
                  Cancel
                </Button>
                <Button type="primary" onClick={() => form.submit()}>
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
        <Divider />
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <Avatar size={128} src="/placeholder.svg" />
            {isEditing && (
              <div style={{ marginTop: "10px" }}>
                <Button onClick={() => message.info("Change photo clicked")}>
                  Change Photo
                </Button>
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <Form
              form={form}
              layout="vertical"
              initialValues={defaultValues}
              onFinish={onSubmit}
              disabled={!isEditing}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Form.Item label="Employee ID" name="employeeId">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="First Name" name="firstName">
                  <Input />
                </Form.Item>
                <Form.Item label="Last Name" name="lastName">
                  <Input />
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <Input />
                </Form.Item>
                <Form.Item label="Phone" name="phone">
                  <Input />
                </Form.Item>
                <Form.Item label="Department" name="department">
                  <Input />
                </Form.Item>
                <Form.Item label="Position" name="position">
                  <Input />
                </Form.Item>
                <Form.Item label="Join Date" name="joinDate">
                  <Input type="date" />
                </Form.Item>
                <Form.Item label="Address" name="address">
                  <Input />
                </Form.Item>
                <Form.Item label="Gender" name="gender">
                  <Select>
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Height (cm)" name="height">
                  <Input type="number" />
                </Form.Item>
                <Form.Item label="Weight (kg)" name="weight">
                  <Input type="number" />
                </Form.Item>
                
              </div>
              <Form.Item label="Bio" name="bio">
                <TextArea rows={4} />
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
}