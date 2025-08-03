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
  Spin,
  Select,
} from "antd";
import {
  UploadOutlined,
  FileImageOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import styles from "./Edit.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { storage } from "../../../../firebase/config";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useAuth } from "../../../../contexts/AuthContext.jsx";

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const EditMealPage = () => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [isIngredientsModalVisible, setIsIngredientsModalVisible] =
    useState(false);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [searchIngredient, setSearchIngredient] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [mealData, setMealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [addingIngredient, setAddingIngredient] = useState(false);
  const { authData } = useAuth();
  const token = authData?.accessToken;
  const orgId = authData?.orgId;
  const navigate = useNavigate();
  const location = useLocation();
  const urL = import.meta.env.VITE_BASE_URL;

  // Define parseIngredientsFromMealData function first
  const parseIngredientsFromMealData = async (ingredientsArray) => {
    if (!ingredientsArray || ingredientsArray.length === 0) {
      return [];
    }

    try {
      const response = await axios.get(`${urL}/ingredients/org/${authData?.orgId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allIngredients = Array.isArray(response.data) ? response.data : [];

      // Format all ingredients with selected: false initially
      const formattedIngredients = allIngredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        selected: false,
      }));

      // Set selected to true for ingredients in the meal
      const usedIngredientIds = ingredientsArray.map((ing) =>
        typeof ing === "object" && ing.ingredientId ? ing.ingredientId : ing
      );

      const parsedIngredients = formattedIngredients.map((ingredient) => ({
        ...ingredient,
        selected: usedIngredientIds.includes(ingredient.id),
      }));

      console.log("Parsed ingredients for edit:", parsedIngredients);
      return parsedIngredients;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error fetching ingredients:", errorMessage);

      // Fallback to display only used ingredients
      return ingredientsArray.map((ingredient) => {
        const ingredientId = ingredient.ingredientId || ingredient;
        return {
          id: ingredientId,
          name: `Ingredient ID: ${ingredientId}`,
          selected: true,
        };
      });
    }
  };

  // Now use the function in useEffect
  useEffect(() => {
    const fetchMealData = async () => {
      if (location.state && location.state.meal) {
        const meal = location.state.meal;
        setMealData(meal);
        setImageUrl(meal.imageUrl);
        setOriginalImageUrl(meal.imageUrl);

        // Ensure category is treated as an array
        const mealCategories = Array.isArray(meal.category)
          ? meal.category
          : meal.category
          ? [meal.category]
          : [];

        form.setFieldsValue({
          id: meal.id,
          nameEnglish: meal.nameEnglish,
          nameSinhala: meal.nameSinhala,
          nameTamil: meal.nameTamil,
          price: meal.price,
          description: meal.description,
          category: mealCategories,
        });

        // Parse and set the selected ingredients
        if (meal.ingredients && meal.ingredients.length > 0) {
          try {
            const parsedIngredients = await parseIngredientsFromMealData(
              meal.ingredients
            );
            console.log("Parsed ingredients:", parsedIngredients);
            setSelectedIngredients(parsedIngredients);
          } catch (error) {
            console.error("Error setting ingredients:", error);
            message.error("Failed to load ingredient details");
          }
        }

        setLoading(false);
      } else {
        message.error("No meal data found for editing");
        navigate("/kitchen-meal");
      }
    };

    fetchMealData();
  }, [location.state, form, navigate]);

  // Updated fetchIngredients function to match AddMeal component
  const fetchIngredients = async () => {
    setLoadingIngredients(true);
    try {
      const response = await axios.get(`${urL}/ingredients/org/${authData?.orgId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(response.data) ? response.data : [];

      // Transform and mark previously selected ingredients
      const formattedIngredients = data.map((ingredient) => {
        // Check if this ingredient was previously selected
        const existingIngredient = selectedIngredients.find(
          (sel) => String(sel.id) === String(ingredient.id)
        );

        return {
          id: ingredient.id,
          name: ingredient.name,
          selected: Boolean(existingIngredient),
        };
      });

      setIngredients(formattedIngredients);

      if (formattedIngredients.length === 0) {
        message.warning("No ingredients found");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      message.error(`Error fetching ingredients: ${errorMessage}`);
      console.error("Error fetching ingredients:", error);
      setIngredients([]);
    } finally {
      setLoadingIngredients(false);
    }
  };

  // Add new ingredient function (same as AddMeal component)
  const handleAddNewIngredient = async () => {
    if (!newIngredientName.trim()) {
      message.warning("Ingredient name cannot be empty.");
      return;
    }

    setAddingIngredient(true);

    try {
      const response = await axios.post(
        `${urL}/ingredients`,
        {
          name: newIngredientName.trim(),
          orgId: authData?.orgId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        message.success("Ingredient added successfully!");
        setNewIngredientName("");
        fetchIngredients(); // Refresh ingredient list
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      message.error(`Failed to add ingredient: ${errorMessage}`);
    } finally {
      setAddingIngredient(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrl(null);
    setSelectedIngredients([]);
    console.log("Form canceled");
    navigate("/kitchen-meal");
  };

  // Function to delete the old image from Firebase
  const deleteImageFromFirebase = async (imageUrl) => {
    if (!imageUrl) return true;

    try {
      // Check if this is a Firebase Storage URL
      if (!imageUrl.includes("firebasestorage.googleapis.com")) {
        console.warn(
          "Image URL doesn't appear to be from Firebase Storage:",
          imageUrl
        );
        return false;
      }

      // Extract the file path from the URL
      let urlPath;
      if (imageUrl.startsWith("gs://")) {
        urlPath = imageUrl.replace(/^gs:\/\/[^\/]+\//, "");
      } else {
        urlPath = decodeURIComponent(imageUrl.split("/o/")[1]?.split("?")[0]);
      }

      if (!urlPath) {
        console.warn("Could not parse image URL for deletion:", imageUrl);
        return false;
      }

      // Create a reference to the file to delete
      const imageRef = ref(storage, urlPath);

      // Delete the file
      await deleteObject(imageRef);
      console.log("Old image successfully deleted from Firebase Storage");
      return true;
    } catch (error) {
      console.error("Error deleting old image from Firebase:", error);
      return false;
    }
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

    if (selectedIngredients.length === 0) {
      message.warning("Please select at least one ingredient for the meal");
      return;
    }

    setSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      // Only upload to Firebase if a new image was selected
      if (imageFile) {
        finalImageUrl = await uploadImageToFirebase(imageFile);

        // If we have a new image and there was an old image, delete the old one
        if (originalImageUrl && originalImageUrl !== finalImageUrl) {
          console.log("Deleting old image:", originalImageUrl);
          const deleted = await deleteImageFromFirebase(originalImageUrl);
          if (deleted) {
            console.log("Old image deleted successfully");
          } else {
            console.warn("Failed to delete old image");
          }
        }
      }

      // Format ingredients to match the new format [{ ingredientId: "id" }]
      const ingredientsData = selectedIngredients.map((ingredient) => ({
        ingredientId: ingredient.id,
      }));

      // Ensure category is an array
      const categoryArray = Array.isArray(values.category)
        ? values.category
        : values.category
        ? [values.category]
        : [];

      // Prepare the data to be sent to the API - exclude name fields from update
      const updateData = {
        nameEnglish: values.nameEnglish,
        nameSinhala: values.nameSinhala,
        nameTamil: values.nameTamil,
        description: values.description,
        price: parseFloat(values.price),
        imageUrl: finalImageUrl,
        category: categoryArray,
        ingredients: ingredientsData,
        orgId: orgId, // Include orgId in the update data
      };

      console.log("Sending update data:", updateData);

      // Make the API call to update the meal
      const response = await axios.patch(
        `${urL}/meal/${mealData.id}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Meal updated successfully");
        navigate("/kitchen-meal");
      } else {
        throw new Error("Failed to update meal");
      }
    } catch (error) {
      console.error("Error updating meal:", error);

      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);

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
        console.error("No response received:", error.request);
        message.error("Failed to update meal: No response from server");
      } else {
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

    setImageFile(file);

    // Use object URL for preview instead of Data URL
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);

    // Clean up the object URL when component unmounts or when URL changes
    return () => URL.revokeObjectURL(objectUrl);
  };

  const showIngredientsModal = () => {
    setIsIngredientsModalVisible(true);
    fetchIngredients();
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
    const selected = ingredients.filter((ingredient) => ingredient.selected);

    console.log("Selected ingredients from modal:", selected);
    setSelectedIngredients(selected);
    setIsIngredientsModalVisible(false);

    if (selected.length > 0) {
      message.success(`${selected.length} ingredients selected`);
    } else {
      message.warning("No ingredients selected");
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
                  label="Meal ID"
                  name="id"
                  rules={[{ required: true, message: "Please enter Meal Id" }]}
                >
                  <Input disabled />
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
                    <Option value="Snack">Snack</Option>
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

                {/* Selected Ingredients Display */}
                <div className={styles.selectedIngredientsContainer}>
                  <p className={styles.selectedIngredientsTitle}>
                    Selected Ingredients:
                  </p>
                  {selectedIngredients.length > 0 ? (
                    <ul className={styles.selectedIngredientsList}>
                      {selectedIngredients.map((ingredient) => (
                        <li
                          key={ingredient.id}
                          className={styles.selectedIngredientItem}
                        >
                          {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={styles.noIngredientsMessage}>
                      No ingredients selected yet.
                    </div>
                  )}
                </div>
              </Col>
            </Row>

            <Row className={styles.actionButtonsRow}>
              <Col span={12} className={styles.cancelButtonCol}>
                <Button
                  onClick={handleCancel}
                  className={styles.cancelButton}
                  disabled={submitting}
                >
                  Clear
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

      {/* Select Ingredient Modal */}
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

        {/* Add New Ingredient Section */}
        <div className={styles.addNewIngredientSection}>
          <Input
            placeholder="New ingredient name"
            value={newIngredientName}
            onChange={(e) => setNewIngredientName(e.target.value)}
            className={styles.newIngredientInput}
          />
          <Button
            type="dashed"
            onClick={handleAddNewIngredient}
            loading={addingIngredient}
            disabled={!newIngredientName.trim()}
            className={styles.addIngredientButton}
          >
            Add Ingredient
          </Button>
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
                    {ingredient.name}
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

export default EditMealPage;