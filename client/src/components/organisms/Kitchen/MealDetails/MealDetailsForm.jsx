import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  Modal,
  Checkbox,
  Select,
  Spin,
} from "antd";
import {
  UploadOutlined,
  FileImageOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import styles from "./MealDetailsForm.module.css";
import { useNavigate } from "react-router-dom";
import { storage } from "../../../../firebase/config"; // Import Firebase storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase storage functions

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const AddMealPage = () => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Store the actual file
  const fileInputRef = useRef(null);
  const [isIngredientsModalVisible, setIsIngredientsModalVisible] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [searchIngredient, setSearchIngredient] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [uploading, setUploading] = useState(false); // Track upload status
  const [loadingIngredients, setLoadingIngredients] = useState(false); // Track ingredients loading state

  const navigate = useNavigate();

  // Fetch ingredients from API when the modal is opened
  const fetchIngredients = async () => {
    setLoadingIngredients(true);
    try {
      const response = await fetch(
        "http://localhost:3000/Ingredients/optimized"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch ingredients");
      }

      const data = await response.json();
      console.log("API response:", data);

      // Extract ingredients from both arrays in the response
      const priority1Ingredients = Array.isArray(data.priority1Ingredients)
        ? data.priority1Ingredients
        : [];
      const optimizedIngredients = Array.isArray(data.optimizedIngredients)
        ? data.optimizedIngredients
        : [];

      // Combine both arrays
      const allIngredients = [...priority1Ingredients, ...optimizedIngredients];

      // Transform to our component's expected format
      const formattedIngredients = allIngredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        selected: false,
      }));

      setIngredients(formattedIngredients);

      if (formattedIngredients.length === 0) {
        message.warning("No ingredients found in the API response");
      }
    } catch (error) {
      message.error(`Error fetching ingredients: ${error.message}`);
      console.error("Error fetching ingredients:", error);
      setIngredients([]);
    } finally {
      setLoadingIngredients(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrl(null);
    setImageFile(null);
    setSelectedIngredients([]);
    console.log("Form canceled");
  };

  const handleSubmit = async (values) => {
    if (!imageFile) {
      message.warning("Please select an image for the meal");
      return;
    }
  
    if (selectedIngredients.length === 0) {
      message.warning("Please select at least one ingredient for the meal");
      return;
    }
  
    setUploading(true);
  
    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `meals/${Date.now()}-${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
  
      // Get the download URL of the uploaded image
      const downloadURL = await getDownloadURL(imageRef);
  
      // Format ingredients data - make sure ingredientId is a number
      const ingredientsData = selectedIngredients.map((ingredient) => ({
        ingredientId: parseInt(ingredient.id),
      }));
  
      const mealData = {
        nameEnglish: values.nameEnglish,
        nameSinhala: values.nameSinhala,
        nameTamil: values.nameTamil,
        description: values.description || "",
        category: values.category || [],
        price: parseFloat(values.price),
        imageUrl: downloadURL,
        ingredients: ingredientsData,
      };
  
      console.log("Submitting meal data:", mealData);
  
      const response = await fetch("http://localhost:3000/meal", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mealData),
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add meal");
      }
  
      console.log("Server response:", responseData);
      message.success("Meal added successfully!");
      form.resetFields();
      setImageUrl(null);
      setImageFile(null);
      setSelectedIngredients([]);
      navigate("/kitchen-meal");
    } catch (error) {
      console.error("Detailed error:", error);
      message.error(`Error adding meal: ${error.message}`);
    } finally {
      setUploading(false);
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

    // Check file size - limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      message.error("Image size must be less than 2MB!");
      return;
    }

    // Store the file object for later upload
    setImageFile(file);

    // Preview the image
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const showIngredientsModal = () => {
    setIsIngredientsModalVisible(true);
    fetchIngredients(); // Fetch ingredients when modal is opened
  };

  const handleIngredientsModalCancel = () => {
    setIsIngredientsModalVisible(false);
  };

  const handleIngredientsSearch = (e) => {
    setSearchIngredient(e.target.value);
  };

  const handleIngredientSelect = (id) => {
    setIngredients(
      ingredients.map((ingredient) =>
        ingredient.id === id
          ? { ...ingredient, selected: !ingredient.selected }
          : ingredient
      )
    );
  };

  const handleIngredientsConfirm = () => {
    const selected = ingredients.filter(
      (ingredient) => ingredient.selected
    );
    setSelectedIngredients(selected);
    setIsIngredientsModalVisible(false);

    if (selected.length > 0) {
      message.success(`${selected.length} ingredients selected`);
    }
  };

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchIngredient.toLowerCase())
  );

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
                    onClick={handleImageClick}
                  >
                    {!imageUrl && (
                      <div className={styles.uploadHint}>
                        <FileImageOutlined
                          style={{
                            fontSize: "60px",
                            marginBottom: "12px",
                            color: "#d9d9d9",
                          }}
                        />
                        <p
                          style={{
                            fontFamily: "Ubuntu, sans-serif",
                            fontSize: "16px",
                            color: "#888",
                          }}
                        >
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
                  disabled={uploading}
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

                <Form.Item
                  label="Category"
                  name="category"
                  rules={[
                    {
                      required: true,
                      message: "Please select at least one category",
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select categories"
                    style={{ width: "100%" }}
                  >
                    <Option value="Breakfast">Breakfast</Option>
                    <Option value="Lunch">Lunch</Option>
                    <Option value="Dinner">Dinner</Option>
                  </Select>
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
                    disabled={uploading}
                  >
                    Choose Ingredients
                  </Button>
                </Form.Item>

                {selectedIngredients.length > 0 && (
                  <div className={styles.selectedIngredientsContainer}>
                    <p className={styles.selectedIngredientsTitle}>
                      Selected Ingredients:
                    </p>
                    <ul className={styles.selectedIngredientsList}>
                      {selectedIngredients.map((ingredient) => (
                        <li key={ingredient.id}>
                          {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Col>
            </Row>

            <Row className={styles.actionButtonsRow}>
              <Col span={12} className={styles.cancelButtonCol}>
                <Button
                  onClick={handleCancel}
                  className={styles.cancelButton}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </Col>
              <Col span={12} className={styles.confirmButtonCol}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={styles.confirmButton}
                  loading={uploading}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Confirm"}
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
          {loadingIngredients ? (
            <div className={styles.loadingContainer}>
              <Spin size="large" />
              <p>Loading ingredients...</p>
            </div>
          ) : filteredIngredients.length > 0 ? (
            filteredIngredients.map((ingredient) => (
              <div key={ingredient.id} className={styles.ingredientItem}>
                <div className={styles.ingredientNameContainer}>
                  <Checkbox
                    checked={ingredient.selected}
                    onChange={() => handleIngredientSelect(ingredient.id)}
                    className={styles.ingredientCheckbox}
                  >
                    {ingredient.name} (ID: {ingredient.id})
                  </Checkbox>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noIngredientsMessage}>
              No ingredients found. Try adjusting your search.
            </div>
          )}
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