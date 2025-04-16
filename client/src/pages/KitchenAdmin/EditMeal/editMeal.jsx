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
  InputNumber,
  Spin,
  Select,
} from "antd";
import {
  UploadOutlined,
  FileImageOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Navbar from "../../../components/KitchenAdmin/header/header";
import styles from "./editMeal.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
// Import Firebase services
import { storage } from "../../../firebase/config"; // Adjust path to your Firebase config
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const EditMealPage = () => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [isIngredientsModalVisible, setIsIngredientsModalVisible] =
    useState(false);
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "Rice", quantity: 0, selected: false },
    { id: 2, name: "Tomato", quantity: 0, selected: false },
    { id: 3, name: "Oil", quantity: 0, selected: false },
    { id: 4, name: "Dhal", quantity: 0, selected: false },
    { id: 5, name: "Potato", quantity: 0, selected: false },
    { id: 6, name: "Chicken", quantity: 0, selected: false },
    { id: 7, name: "Onion", quantity: 0, selected: false },
    { id: 8, name: "Garlic", quantity: 0, selected: false },
  ]);
  const [searchIngredient, setSearchIngredient] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [mealData, setMealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // Effect to load meal data when component mounts
  useEffect(() => {
    if (location.state && location.state.meal) {
      const meal = location.state.meal;
      setMealData(meal);
      setImageUrl(meal.imageUrl);

      // Set form values
      form.setFieldsValue({
        nameEnglish: meal.nameEnglish,
        nameSinhala: meal.nameSinhala,
        nameTamil: meal.nameTamil,
        price: meal.price,
        description: meal.description,
        category: meal.category || "all", // Set default category if not present
      });

      // If meal has ingredients, populate the selected ingredients
      if (meal.ingredients && meal.ingredients.length > 0) {
        setSelectedIngredients(meal.ingredients);

        // Update the ingredients list to mark the selected ones
        const updatedIngredients = [...ingredients];
        meal.ingredients.forEach((selectedIng) => {
          const index = updatedIngredients.findIndex(
            (ing) => ing.id === selectedIng.id
          );
          if (index !== -1) {
            updatedIngredients[index] = {
              ...updatedIngredients[index],
              selected: true,
              quantity: selectedIng.quantity,
            };
          }
        });
        setIngredients(updatedIngredients);
      }

      setLoading(false);
    } else {
      message.error("No meal data found for editing");
      navigate("/kitchen-meal"); // Redirect back to meals list
    }
  }, [location.state, form, navigate, ingredients]);

  const handleCancel = () => {
    form.resetFields();
    setImageUrl(null);
    setSelectedIngredients([]);
    console.log("Form canceled");
    navigate("/kitchen-meal"); // Navigate back to meals list
  };

  const uploadImageToFirebase = async (file) => {
    // If no new image was selected, return the existing URL
    if (!file) {
      return imageUrl;
    }

    try {
      // Create a unique file path in Firebase Storage
      const storageFilePath = `meals/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storageFilePath);

      // Upload the file to Firebase Storage
      const uploadTask = await uploadBytes(storageRef, file);
      console.log("Image uploaded successfully:", uploadTask);

      // Get the download URL of the uploaded file
      const downloadURL = await getDownloadURL(uploadTask.ref);
      console.log("Download URL:", downloadURL);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading image to Firebase:", error);
      message.error("Failed to upload image. Please try again.");
      throw error;
    }
  };

  const handleSubmit = async (values) => {
    if (!imageUrl) {
      message.warning("Please select an image for the meal");
      return;
    }

    setSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      // Only upload to Firebase if a new image was selected
      if (imageFile) {
        message.loading({ content: "Uploading image...", key: "imageUpload" });
        finalImageUrl = await uploadImageToFirebase(imageFile);
        message.success({
          content: "Image uploaded successfully",
          key: "imageUpload",
        });
      }

      // Prepare the data to be sent to the API
      const updateData = {
        nameEnglish: values.nameEnglish,
        nameSinhala: values.nameSinhala,
        nameTamil: values.nameTamil,
        description: values.description,
        price: parseFloat(values.price), // Convert price to number
        imageUrl: finalImageUrl,
        category: values.category, // Add category field
        // Only include ingredients if they were modified
        ...(selectedIngredients.length > 0
          ? { ingredients: selectedIngredients }
          : {}),
      };

      // Log what we're sending to the API for debugging
      console.log("Sending update data:", updateData);
      console.log("Data size (bytes):", JSON.stringify(updateData).length);
      console.log("To endpoint:", `http://localhost:3000/meal/${mealData.id}`);

      // Make the API call to update the meal
      const response = await axios.patch(
        `http://localhost:3000/meal/${mealData.id}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API response:", response);

      if (response.status === 200) {
        message.success("Meal updated successfully");
        navigate("/kitchen-meal");
      } else {
        throw new Error("Failed to update meal");
      }
    } catch (error) {
      console.error("Error updating meal:", error);

      // Enhanced error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);

        if (error.response.status === 413) {
          message.error(
            "Request entity too large. Image may be too big or data package exceeds server limits."
          );
        } else {
          message.error(
            `Failed to update meal: ${
              error.response.data.message || error.response.statusText
            }`
          );
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        message.error("Failed to update meal: No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        message.error(`Failed to update meal: ${error.message}`);
      }
    } finally {
      setSubmitting(false);
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

    setImageFile(file); // Store the file for later upload

    // Use object URL for preview instead of Data URL
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);

    // Clean up the object URL when component unmounts or when URL changes
    return () => URL.revokeObjectURL(objectUrl);
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
    setIngredients(
      ingredients.map((ingredient) =>
        ingredient.id === id
          ? { ...ingredient, selected: !ingredient.selected }
          : ingredient
      )
    );
  };

  const handleQuantityChange = (id, value) => {
    setIngredients(
      ingredients.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, quantity: value } : ingredient
      )
    );
  };

  const handleIngredientsConfirm = () => {
    const selected = ingredients.filter(
      (ingredient) => ingredient.selected && ingredient.quantity > 0
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <p>Loading meal data...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />

      <div className={styles.contentWrapper}>
        <Card className={styles.formCard}>
          <Title level={4} className={styles.cardTitle}>
            Edit Meal Details
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
                >
                  {imageUrl ? "Change Image" : "Choose Image"}
                </Button>
                {imageFile && (
                  <p className={styles.fileInfo}>
                    Selected: {imageFile.name} (
                    {(imageFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
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

                {/* Add Category Field */}
                <Form.Item
                  label="Category"
                  name="category"
                  rules={[
                    { required: true, message: "Please select a category" },
                  ]}
                >
                  <Select placeholder="Select a category">
                    <Option value="Breakfast">Breakfast</Option>
                    <Option value="Lunch">Lunch</Option>
                    <Option value="Dinner">Dinner</Option>
                    <Option value="All">All</Option>
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
                <Button
                  onClick={handleCancel}
                  className={styles.cancelButton}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </Col>
              <Col span={12} className={styles.confirmButtonCol}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={styles.confirmButton}
                  loading={submitting}
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Confirm"}
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
          {filteredIngredients.map((ingredient) => (
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
                  onChange={(value) =>
                    handleQuantityChange(ingredient.id, value)
                  }
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

export default EditMealPage;