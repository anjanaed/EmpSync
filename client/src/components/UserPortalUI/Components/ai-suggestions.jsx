import React, { useState } from "react";
import { Card, Tabs, Badge, Button, Modal, Typography, Progress, List } from "antd";
import {
  InfoCircleOutlined,
  HeartOutlined,
  RiseOutlined,
  AlertOutlined,
  RestOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Updated mock data for AI suggestions
const recommendedMeals = [
  {
    id: "REC-001",
    name: "Mediterranean Quinoa Bowl",
    type: "Lunch",
    calories: 420,
    protein: 18,
    carbs: 52,
    fat: 16,
    ingredients: ["Quinoa", "Chickpeas", "Cucumber", "Cherry tomatoes", "Feta cheese", "Olive oil", "Lemon juice"],
    benefits: [
      "High in protein to support muscle maintenance",
      "Complex carbs for sustained energy",
      "Healthy fats for heart health",
      "Rich in fiber to support digestion",
    ],
    reasonForRecommendation:
      "Based on your height and weight, this balanced meal provides optimal nutrition while supporting your health goals. The Mediterranean diet components are known to promote heart health and weight management.",
  },
  {
    id: "REC-002",
    name: "Grilled Salmon with Roasted Vegetables",
    type: "Dinner",
    calories: 480,
    protein: 32,
    carbs: 25,
    fat: 24,
    ingredients: ["Salmon fillet", "Asparagus", "Bell peppers", "Zucchini", "Olive oil", "Lemon", "Herbs"],
    benefits: [
      "Rich in omega-3 fatty acids for heart and brain health",
      "High-quality protein for muscle repair",
      "Low-glycemic carbs to maintain stable blood sugar",
      "Antioxidant-rich vegetables",
    ],
    reasonForRecommendation:
      "This meal is recommended based on your nutritional needs and previous meal choices. The protein content supports your muscle maintenance needs, while the omega-3 fatty acids contribute to overall health.",
  },
  {
    id: "REC-003",
    name: "Greek Yogurt Parfait",
    type: "Breakfast",
    calories: 320,
    protein: 22,
    carbs: 40,
    fat: 8,
    ingredients: ["Greek yogurt", "Mixed berries", "Honey", "Granola", "Chia seeds"],
    benefits: [
      "High protein breakfast to kickstart metabolism",
      "Probiotics for gut health",
      "Antioxidants from berries",
      "Sustained energy from complex carbs",
    ],
    reasonForRecommendation:
      "Based on your morning activity patterns and nutritional needs, this breakfast provides a balanced start to your day with adequate protein and energy without excessive calories.",
  },
];

const pastOrderAnalysis = [
  {
    category: "Protein Intake",
    value: 85,
    status: "Optimal",
    description: "Your protein intake is within the recommended range for your height and weight.",
  },
  {
    category: "Carbohydrate Balance",
    value: 65,
    status: "Good",
    description: "Your carbohydrate intake is balanced, but could benefit from more complex carbs.",
  },
  {
    category: "Fat Consumption",
    value: 70,
    status: "Good",
    description: "Your fat intake is balanced, with a good ratio of healthy fats.",
  },
  {
    category: "Caloric Balance",
    value: 90,
    status: "Excellent",
    description: "Your caloric intake is well-matched to your activity level and body composition.",
  },
  {
    category: "Meal Variety",
    value: 60,
    status: "Moderate",
    description: "You could benefit from more variety in your meal choices.",
  },
];

export function AISuggestions() {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showMealDetails = (meal) => {
    setSelectedMeal(meal);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedMeal(null);
  };

  return (
    <Tabs defaultActiveKey="recommendations">
      <TabPane tab="Recommendations" key="recommendations">
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {recommendedMeals.map((meal) => (
            <Card
              key={meal.id}
              title={meal.name}
              extra={<Badge status="success" text="Recommended" />}
              style={{ width: 300 }}
              actions={[
                <Button size="small" icon={<InfoCircleOutlined />} onClick={() => showMealDetails(meal)}>
                  Why This Meal?
                </Button>,
                <Button size="small" type="link" icon={<RestOutlined />}>
                  Order Now
                </Button>,
              ]}
            >
              <p><strong>Type:</strong> {meal.type}</p>
              <p><strong>Calories:</strong> {meal.calories}</p>
              <p><strong>Protein:</strong> {meal.protein}g</p>
              <p><strong>Carbs:</strong> {meal.carbs}g</p>
              <p><strong>Fat:</strong> {meal.fat}g</p>
            </Card>
          ))}
        </div>
      </TabPane>

      <TabPane tab="Dietary Analysis" key="analysis">
        <Card>
          <Title level={4}>Your Dietary Analysis</Title>
          <List
            dataSource={pastOrderAnalysis}
            renderItem={(item) => (
              <List.Item>
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text strong>{item.category}</Text>
                    <Badge
                      status={item.status === "Excellent" ? "success" : item.status === "Good" ? "processing" : "warning"}
                      text={item.status}
                    />
                  </div>
                  <Progress percent={item.value} />
                  <Text type="secondary">{item.description}</Text>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </TabPane>

      <TabPane tab="Health Insights" key="insights">
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Card title="Nutritional Balance">
            <p>Protein</p>
            <Progress percent={28} size="small" />
            <p>Carbohydrates</p>
            <Progress percent={45} size="small" />
            <p>Fats</p>
            <Progress percent={27} size="small" />
            <h4 style={{ marginTop: 16 }}>Analysis:</h4>
            <p style={{ color: "#888" }}>
              Your macronutrient distribution is well-balanced. Based on your height (175cm) and weight (70kg), this
              ratio supports your metabolic needs and activity level. Consider slightly increasing protein intake on
              workout days.
            </p>
          </Card>

          <Card title="Health Recommendations">
            <ul>
              <li>
                <RiseOutlined style={{ color: "green", marginRight: 8 }} />
                Increase Fiber Intake
              </li>
              <li>
                <HeartOutlined style={{ color: "red", marginRight: 8 }} />
                Healthy Fats
              </li>
              <li>
                <AlertOutlined style={{ color: "orange", marginRight: 8 }} />
                Hydration Reminder
              </li>
              <li>
                <RestOutlined style={{ color: "blue", marginRight: 8 }} />
                Meal Timing
              </li>
            </ul>
          </Card>
        </div>
      </TabPane>

      <Modal
        title={selectedMeal?.name}
        visible={isModalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
        ]}
      >
        {selectedMeal && (
          <div>
            <Title level={5}>Why This Meal?</Title>
            <Text>{selectedMeal.reasonForRecommendation}</Text>
            <Title level={5} style={{ marginTop: "16px" }}>Ingredients:</Title>
            <List
              dataSource={selectedMeal.ingredients}
              renderItem={(ingredient) => <List.Item>{ingredient}</List.Item>}
            />
            <Title level={5} style={{ marginTop: "16px" }}>Benefits:</Title>
            <List
              dataSource={selectedMeal.benefits}
              renderItem={(benefit) => <List.Item>{benefit}</List.Item>}
            />
          </div>
        )}
      </Modal>
    </Tabs>
  );
}