import React, { useState, useRef } from "react";
import { Form, Input, Button, Card, Row, Col, Typography, message, Modal, Checkbox, InputNumber } from "antd";
import { UploadOutlined, FileImageOutlined, SearchOutlined } from "@ant-design/icons";
import Navbar from "../../../components/KitchenAdmin/header/header";
import styles from "./MealDetailsForm.module.css";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Title } = Typography;

const AddMealPage = () => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [isIngredientsModalVisible, setIsIngredientsModalVisible] = useState(false);
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "Rice", quantity: 0, selected: false },
    { id: 2, name: "Tomato", quantity: 0, selected: false },
    { id: 3, name: "Oil", quantity: 0, selected: false },
    { id: 4, name: "Dhal", quantity: 0, selected: false },
    { id: 5, name: "Potato", quantity: 0, selected: false },
    { id: 6, name: "Chicken", quantity: 0, selected: false },
    { id: 7, name: "Onion", quantity: 0, selected: false },
    { id: 7, name: "Onion", quantity: 0, selected: false },
    { id: 7, name: "Onion", quantity: 0, selected: false },
    { id: 7, name: "Onion", quantity: 0, selected: false },
    { id: 7, name: "Onion", quantity: 0, selected: false },
    { id: 7, name: "Onion", quantity: 0, selected: false },
    { id: 7, name: "Onion", quantity: 0, selected: false },
    { id: 8, name: "Garlic", quantity: 0, selected: false }
  ]);
  const [searchIngredient, setSearchIngredient] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const navigate = useNavigate();

  const handleCancel = () => {
    form.resetFields();
    setImageUrl(null);
    setSelectedIngredients([]);
    console.log("Form canceled");
    // Navigate away: navigate('/meals')
  };

  const handleSubmit = async (values) => {
    if (!imageUrl) {
      message.warning("Please select an image for the meal");
      return;
    }
  
    if (selectedIngredients.length === 0) {
      message.warning("Please select at least one ingredient for the meal");
      return;
    }
  
    const mealData = {
      id: values.Id,
      nameEnglish: values.nameEnglish,
      nameSinhala: values.nameSinhala,
      nameTamil: values.nameTamil,
      description: values.description,
      price: parseFloat(values.price),
      imageUrl: imageUrl,
      createdAt: new Date().toISOString(), // Auto-generate timestamp
     
    };
  
    try {
      const response = await fetch("http://localhost:3000/meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mealData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add meal");
      }
  
      message.success("Meal added successfully!");
      form.resetFields();
      setImageUrl(null);
      setSelectedIngredients([]);
      navigate("/kitchen-meal"); // Redirect after success
    } catch (error) {
      message.error(error.message);
    }
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

  const showIngredientsModal = () => {
    setIsIngredientsModalVisible(true);
  };

  const handleIngredientsModalCancel = () => {
    setIsIngredientsModalVisible(false);
  };

  const handleIngredientsSearch = (e) => {
    setSearchIngredient(e.target.value);
  };

  const handleIngredientSelect = (id) => {
    setIngredients(ingredients.map(ingredient => 
      ingredient.id === id 
        ? { ...ingredient, selected: !ingredient.selected } 
        : ingredient
    ));
  };

  const handleQuantityChange = (id, value) => {
    setIngredients(ingredients.map(ingredient => 
      ingredient.id === id 
        ? { ...ingredient, quantity: value } 
        : ingredient
    ));
  };

  const handleIngredientsConfirm = () => {
    const selected = ingredients.filter(ingredient => ingredient.selected && ingredient.quantity > 0);
    setSelectedIngredients(selected);
    setIsIngredientsModalVisible(false);
    
    if (selected.length > 0) {
      message.success(`${selected.length} ingredients selected`);
    }
  };

  const filteredIngredients = ingredients.filter(ingredient => 
    ingredient.name.toLowerCase().includes(searchIngredient.toLowerCase())
  );

  return (
    <div className={styles.pageContainer}>
      <Navbar/>

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
                    onClick={handleImageClick}
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
                  label=" Meal ID"
                  name="Id"
                  rules={[{ required: true, message: "Please enter Meal Id" }]}
                >
                  <Input placeholder="Enter Meal ID" />
                </Form.Item>
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
                    onClick={showIngredientsModal}
                  >
                    Choose Ingredients
                  </Button>
                </Form.Item>

                {selectedIngredients.length > 0 && (
                  <div className={styles.selectedIngredientsContainer}>
                    <p className={styles.selectedIngredientsTitle}>Selected Ingredients:</p>
                    <ul className={styles.selectedIngredientsList}>
                      {selectedIngredients.map(ingredient => (
                        <li key={ingredient.id}>
                          {ingredient.name} - {ingredient.quantity}g
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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

      <Modal
        title="Available Ingredients"
        open={isIngredientsModalVisible}
        onCancel={handleIngredientsModalCancel}
        footer={null}
        width={800}
        className={styles.ingredientsModal}
      >
        <div className={styles.ingredientsSearchContainer}>
          <Input
            placeholder="Search ingredients"
            prefix={<SearchOutlined />}
            value={searchIngredient}
            onChange={handleIngredientsSearch}
            className={styles.ingredientsSearchInput}
          />
          <Button className={styles.searchButton}>Search</Button>
        </div>
        
        <div className={styles.ingredientsListContainer}>
          {filteredIngredients.map(ingredient => (
            <div key={ingredient.id} className={styles.ingredientItem}>
              <div className={styles.ingredientNameContainer}>
                <Checkbox
                  checked={ingredient.selected}
                  onChange={() => handleIngredientSelect(ingredient.id)}
                  className={styles.ingredientCheckbox}
                >
                  {ingredient.name}
                </Checkbox>
              </div>
              {ingredient.selected && (
                <InputNumber
                  min={0}
                  value={ingredient.quantity}
                  onChange={(value) => handleQuantityChange(ingredient.id, value)}
                  className={styles.quantityInput}
                  placeholder="In Grams"
                />
              )}
            </div>
          ))}
        </div>
        
        <div className={styles.modalFooter}>
          <Button
            type="primary"
            className={styles.confirmButton}
            onClick={handleIngredientsConfirm}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AddMealPage;