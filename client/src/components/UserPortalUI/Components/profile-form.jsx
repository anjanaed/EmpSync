import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Avatar, Divider, Typography, message, Select, Row, Col, Space } from "antd";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext"; // Import useAuth

const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const { Option } = Select;

export function ProfileForm({ employeeId: propEmployeeId }) {
  const { authData } = useAuth(); // Access authData from AuthContext
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null); // State to store user data
  const [form] = Form.useForm();

  // Retrieve employeeId from authData or props/localStorage
  const employeeId = authData?.user?.id || propEmployeeId || localStorage.getItem("employeeId");

  useEffect(() => {
    if (!employeeId) {
      message.error("Employee ID is missing. Please log in again.");
      return;
    }

    // Save employeeId to localStorage if it's available
    localStorage.setItem("employeeId", employeeId);

    // Fetch user data based on employeeId
    const fetchUserData = async () => {
      try {
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
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4}>Personal Information</Title>
            <Paragraph type="secondary">View and update your personal information</Paragraph>
          </Col>
          <Col>
            {!isEditing ? (
              <Button type="primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <Space>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="primary" onClick={() => form.submit()}>
                  Save Changes
                </Button>
              </Space>
            )}
          </Col>
        </Row>
        <Divider />
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={8} style={{ textAlign: "center" }}>
            <Avatar size={128} src="/placeholder.svg" />
            {isEditing && (
              <div style={{ marginTop: "10px" }}>
                <Button onClick={() => message.info("Change photo clicked")}>
                  Change Photo
                </Button>
              </div>
            )}
          </Col>
          <Col xs={24} sm={16}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onSubmit}
              disabled={!isEditing}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Employee ID" name="employeeId">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Email" name="email">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Full Name" name="fullName">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Password" name="password">
                    <Input.Password visibilityToggle={isEditing} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Role" name="role">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Salary" name="salary">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Phone" name="phone">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Birthday" name="birthday">
                    <Input type="date" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Join Date" name="joinDate">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Preferred Language" name="language">
                    <Select>
                      <Option value="Sinhala">Sinhala</Option>
                      <Option value="Tamil">Tamil</Option>
                      <Option value="English">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Address" name="address">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Gender" name="gender">
                    <Select>
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Height (cm)" name="height">
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Weight (kg)" name="weight">
                    <Input type="number" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
}