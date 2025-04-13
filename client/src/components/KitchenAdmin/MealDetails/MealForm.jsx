import React, { useState, useRef } from "react";
import { Form, Input, Button, Card, Row, Col, Typography, message } from "antd";
import { UploadOutlined, FileImageOutlined } from "@ant-design/icons";

import styles from "./MealForm.module.css";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Title } = Typography;

const AddMealPage = () => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  // const handleBackClick = () => {
  //   navigate(-1); // Navigates to the Reports page
  // };

  const handleCancel = () => {
    form.resetFields();
    setImageUrl(null);
    console.log("Form canceled");
    // Navigate away: navigate('/meals')
  };

  const handleSubmit = (values) => {
    if (!imageUrl) {
      message.warning("Please select an image for the meal");
      return;
    }

    const formData = {
      ...values,
      image: imageUrl,
    };

    console.log("Form submitted:", formData);
    // API call to save the meal
    // Then navigate: navigate('/meals')
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.error("You can only upload image files!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.pageContainer}>

      <div className={styles.contentWrapper}>
        <Card className={styles.formCard}>
          <Title level={4} className={styles.cardTitle}>
            Add Meal Details
          </Title>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={24}>
              <Col xs={24} md={10}>
                <div className={styles.imageContainer}>
                  <div
                    className={styles.imagePlaceholder}
                    style={{
                      backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!imageUrl && (
                      <div className={styles.uploadHint}>
                        <FileImageOutlined
                          style={{ fontSize: "60px", marginBottom: "12px", color: "#d9d9d9" }}
                        />
                        <p style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "16px", color: "#888" }}>
                          No image selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <Button
                  icon={<UploadOutlined />}
                  className={styles.chooseImageButton}
                  onClick={handleImageClick}
                >
                  Choose Image
                </Button>
              </Col>

              <Col xs={24} md={14}>
                <Form.Item
                  label="Name"
                  required
                  style={{ marginBottom: "8px" }}
                >
                  <div className={styles.languageInputsContainer}>
                    <Form.Item
                      name="nameEnglish"
                      rules={[
                        {
                          required: true,
                          message: "Please enter name in English",
                        },
                      ]}
                      noStyle
                    >
                      <Input
                        placeholder="Enter in English"
                        className={styles.languageInput}
                      />
                    </Form.Item>
                    <Form.Item
                      name="nameSinhala"
                      rules={[
                        {
                          required: true,
                          message: "Please enter name in Sinhala",
                        },
                      ]}
                      noStyle
                    >
                      <Input
                        placeholder="Enter in Sinhala"
                        className={styles.languageInput}
                      />
                    </Form.Item>
                    <Form.Item
                      name="nameTamil"
                      rules={[
                        {
                          required: true,
                          message: "Please enter name in Tamil",
                        },
                      ]}
                      noStyle
                    >
                      <Input
                        placeholder="Enter in Tamil"
                        className={styles.languageInput}
                      />
                    </Form.Item>
                  </div>
                </Form.Item>
                <Form.Item
                  label="Price"
                  name="price"
                  rules={[{ required: true, message: "Please enter price" }]}
                >
                  <Input placeholder="Enter price" />
                </Form.Item>

                <Form.Item label="Description" name="description">
                  <TextArea placeholder="Enter meal description" rows={4} />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    block
                    className={styles.ingredientsButton}
                  >
                    Choose Ingredients
                  </Button>
                </Form.Item>
              </Col>
            </Row>

            <Row className={styles.actionButtonsRow}>
              <Col span={12} className={styles.cancelButtonCol}>
                <Button onClick={handleCancel} className={styles.cancelButton}>Cancel</Button>
              </Col>
              <Col span={12} className={styles.confirmButtonCol}>
                <Button type="primary" htmlType="submit" className={styles.confirmButton}>
                  Confirm
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AddMealPage;