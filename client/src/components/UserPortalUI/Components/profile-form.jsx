import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Avatar, Divider, Typography, message, Select } from "antd";
import axios from "axios";

const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const { Option } = Select;

export function ProfileForm({ employeeId: propEmployeeId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null); // State to store user data
  const [form] = Form.useForm();

  // Retrieve employeeId from props or localStorage
  const employeeId = propEmployeeId || localStorage.getItem("employeeId");

  useEffect(() => {
    // Save employeeId to localStorage if it's available
    if (employeeId) {
      localStorage.setItem("employeeId", employeeId);
    }

    // Fetch user data based on employeeId
    const fetchUserData = async () => {
      try {
        if (employeeId) {
          const response = await axios.get(`http://localhost:3000/user/${employeeId}`);
          setUserData(response.data);
          form.setFieldsValue({
            employeeId: response.data.id || "EMP12345",
            email: response.data.email || "user@example.com",
            fullName: response.data.name || "John Doe",
            password: response.data.password || "Password",
            role: response.data.role || "Software Engineer",
            salary: response.data.salary,
            phone: response.data.telephone || "123-456-7890",
            birthday: response.data.dob || "1990-01-01",
            language: response.data.language || "English",
            joinDate: response.data.createdAt,
            address: response.data.address || "123 Main St, City, Country",
            gender: response.data.gender || "Male",
            height: response.data.height || 0,
            weight: response.data.weight || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        message.error("Failed to load user data.");
      }
    };

    fetchUserData();
  }, [employeeId, form]);

  const onSubmit = async (values) => {
    try {
      if (!employeeId) {
        message.error("Employee ID is missing. Unable to update profile.");
        return;
      }

      const payload = {
        id: employeeId,
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
        createdAt: userData?.createdAt,
      };

      console.log("Dataset to be sent to the backend:", payload);

      await axios.put(`http://localhost:3000/user/${employeeId}`, payload);

      message.success("Your profile has been updated successfully.");

      // Refetch user data to ensure the latest data is displayed
      const updatedData = await axios.get(`http://localhost:3000/user/${employeeId}`);
      setUserData(updatedData.data);

      // Reload the page
      window.location.reload();
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