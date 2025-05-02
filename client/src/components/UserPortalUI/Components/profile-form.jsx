import { useState, useContext, useEffect } from "react";
import { Form, Input, Button, Card, Avatar, Divider, Typography, message, Select } from "antd";
import { UserContext } from "../../../contexts/UserContext";
import axios from "axios";

const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const { Option } = Select;

export function ProfileForm() {
  const [isEditing, setIsEditing] = useState(false);
  const userData = useContext(UserContext); // Access user data from UserContext
  const [form] = Form.useForm();

  // Set form values when userData is loaded
  useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        employeeId: userData.id || "EMP12345",
        email: userData.email || "user@example.com",
        fullName: userData.name || "John Doe",
        password: userData.password || "Password",
        role: userData.role || "Software Engineer",
        salary: userData.salary,
        phone: userData.telephone || "123-456-7890",
        birthday: userData.dob || "1990-01-01",
        language: userData.language || "English",
        joinDate: userData.createdAt,
        address: userData.address || "123 Main St, City, Country",
        gender: userData.gender || "Male",
        height: userData.height || 0,
        weight: userData.weight || 0,
      });
    }
  }, [userData, form]);

  const onSubmit = async (values) => {
    try {
      const userId = userData?.id;

      if (!userId) {
        message.error("User ID is missing. Unable to update profile.");
        return;
      }

      const payload = {
        id: userId,
        name: values.fullName,
        role: values.role,
        dob: values.birthday ? values.birthday.split("T")[0] : null,
        telephone: values.phone,
        gender: values.gender,
        address: values.address,
        email: values.email,
        password: values.password,
        salary: values.salary,
        thumbId: null,
        supId: null,
        language: values.language,
        height: values.height && values.height !== "0" ? parseInt(values.height, 10) : null,
        weight: values.weight && values.weight !== "0" ? parseInt(values.weight, 10) : null,
        createdAt: userData.createdAt,
      };

      console.log("Dataset to be sent to the backend:", payload);

      await axios.put(`http://localhost:3000/user/${userId}`, payload);

      message.success("Your profile has been updated successfully.");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      message.error("Failed to update profile. Please try again.");
    }
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
                <Button
                  type="primary"
                  onClick={() => {
                    form.submit();
                    window.location.reload();
                  }}
                >
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
              onFinish={onSubmit}
              disabled={!isEditing}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Form.Item label="Employee ID" name="employeeId">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="Full Name" name="fullName">
                  <Input />
                </Form.Item>
                <Form.Item label="Password" name="password">
                  <Input.Password visibilityToggle={isEditing} />
                </Form.Item>
                <Form.Item label="Role" name="role">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="Salary" name="salary">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="Phone" name="phone">
                  <Input />
                </Form.Item>
                <Form.Item label="Birthday" name="birthday">
                  <Input type="date" />
                </Form.Item>
                <Form.Item label="Join Date" name="joinDate">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="Preferred Language" name="language">
                  <Select>
                    <Option value="Sinhala">Sinhala</Option>
                    <Option value="Tamil">Tamil</Option>
                    <Option value="English">English</Option>
                  </Select>
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
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
}