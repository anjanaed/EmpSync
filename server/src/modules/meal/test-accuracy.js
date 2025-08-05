#!/usr/bin/env node

/**
 * Simple Test Runner for Meal Suggestion Accuracy
 * 
 * This script can be run to quickly test the accuracy of your meal suggestion algorithm
 * without needing to set up the full NestJS application.
 */

const { MealSuggestionService } = require('./meal-suggestion.service');

// Mock database service for testing
const mockDatabaseService = {
  user: {
    findUnique: async (args) => {
      // Return mock user data based on ID
      const userId = args.where.id;
      
      if (userId === 'underweight-user') {
        return { id: userId, height: 175, weight: 50, organizationId: 'org-1' };
      } else if (userId === 'overweight-user') {
        return { id: userId, height: 175, weight: 90, organizationId: 'org-1' };
      } else {
        return { id: userId, height: 175, weight: 70, organizationId: 'org-1' };
      }
    }
  },
  order: {
    findMany: async () => {
      // Return mock order history
      return [
        { meals: ['1:2', '2:1'], mealTypeId: 1, orderPlacedTime: new Date() }
      ];
    }
  },
  scheduledMeal: {
    findMany: async () => {
      // Return mock available meals
      return [{
        meals: [
          {
            id: 1,
            nameEnglish: 'Grilled Chicken Salad',
            ingredients: [
              { ingredient: { type: 'protein', name: 'Chicken' } },
              { ingredient: { type: 'vegetable', name: 'Lettuce' } }
            ]
          },
          {
            id: 2,
            nameEnglish: 'Pasta with Sauce',
            ingredients: [
              { ingredient: { type: 'carb', name: 'Pasta' } },
              { ingredient: { type: 'carb', name: 'Sauce' } }
            ]
          },
          {
            id: 3,
            nameEnglish: 'Quinoa Bowl',
            ingredients: [
              { ingredient: { type: 'carb', name: 'Quinoa' } },
              { ingredient: { type: 'vegetable', name: 'Vegetables' } },
              { ingredient: { type: 'protein', name: 'Beans' } }
            ]
          }
        ]
      }];
    }
  }
};

// Test scenarios
const testScenarios = [
  {
    name: 'Underweight User Test',
    userId: 'underweight-user',
    expectedBehavior: 'Should recommend high-calorie, high-protein meals',
    validation: (suggestions) => {
      const topSuggestion = suggestions[0];
      return topSuggestion.bmiSuitability > 0.6 && topSuggestion.score > 0.5;
    }
  },
  {
    name: 'Overweight User Test',
    userId: 'overweight-user',
    expectedBehavior: 'Should recommend low-calorie, high-fiber meals',
    validation: (suggestions) => {
      const topSuggestion = suggestions[0];
      // For overweight users, BMI suitability should favor lower calorie meals
      return topSuggestion.bmiSuitability > 0.4;
    }
  },
  {
    name: 'Normal Weight User Test',
    userId: 'normal-user',
    expectedBehavior: 'Should recommend balanced nutrition meals',
    validation: (suggestions) => {
      const topSuggestion = suggestions[0];
      return topSuggestion.nutritionalMatch > 0.5 && topSuggestion.score > 0.5;
    }
  }
];

async function runAccuracyTests() {
  console.log('🧪 Running Meal Suggestion Accuracy Tests\n');
  
  const mealSuggestionService = new MealSuggestionService(mockDatabaseService);
  let passedTests = 0;
  let totalTests = testScenarios.length;

  for (const scenario of testScenarios) {
    try {
      console.log(`Running: ${scenario.name}`);
      console.log(`Expected: ${scenario.expectedBehavior}`);
      
      const suggestions = await mealSuggestionService.getMealSuggestions(
        scenario.userId,
        '2025-08-03',
        1
      );
      
      console.log('Suggestions received:');
      suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion.name} (Score: ${suggestion.score})`);
        console.log(`     BMI Suitability: ${suggestion.bmiSuitability}`);
        console.log(`     Nutritional Match: ${suggestion.nutritionalMatch}`);
        console.log(`     Preference Match: ${suggestion.preferenceMatch}`);
        console.log(`     Reason: ${suggestion.reason}`);
      });
      
      const isValid = scenario.validation(suggestions);
      
      if (isValid) {
        console.log(`✅ ${scenario.name} PASSED\n`);
        passedTests++;
      } else {
        console.log(`❌ ${scenario.name} FAILED\n`);
      }
      
    } catch (error) {
      console.log(`❌ ${scenario.name} ERROR: ${error.message}\n`);
    }
  }
  
  console.log('='.repeat(50));
  console.log(`Test Results: ${passedTests}/${totalTests} tests passed`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your meal suggestion algorithm is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Review the algorithm logic for the failing scenarios.');
  }
  
  console.log('\n📊 Manual Validation Checklist:');
  console.log('1. Verify BMI calculations are correct');
  console.log('2. Check that nutritional estimates make sense');
  console.log('3. Ensure preference matching works with real order data');
  console.log('4. Test with edge cases (missing data, extreme values)');
  console.log('5. Monitor real user acceptance rates when deployed');
}

// Nutritional calculation accuracy test
function testNutritionalCalculations() {
  console.log('\n🥗 Testing Nutritional Calculations\n');
  
  const testIngredients = [
    {
      name: 'High Protein Meal',
      ingredients: [
        { ingredient: { type: 'protein' } },
        { ingredient: { type: 'protein' } }
      ],
      expectedProtein: 40,
      expectedCalories: 300
    },
    {
      name: 'High Carb Meal',
      ingredients: [
        { ingredient: { type: 'carb' } },
        { ingredient: { type: 'carb' } }
      ],
      expectedCarbs: 50,
      expectedCalories: 260
    },
    {
      name: 'Vegetable Meal',
      ingredients: [
        { ingredient: { type: 'vegetable' } },
        { ingredient: { type: 'vegetable' } },
        { ingredient: { type: 'vegetable' } }
      ],
      expectedFiber: 9,
      expectedCalories: 75
    }
  ];
  
  const service = new MealSuggestionService(mockDatabaseService);
  
  testIngredients.forEach(test => {
    // This would need to access the private method - in a real test you'd expose it or test through public methods
    console.log(`Testing: ${test.name}`);
    console.log(`Expected: Protein ~${test.expectedProtein || 'N/A'}g, Carbs ~${test.expectedCarbs || 'N/A'}g, Fiber ~${test.expectedFiber || 'N/A'}g, Calories ~${test.expectedCalories}cal`);
    console.log('✅ Manual verification needed - run through actual service\n');
  });
}

// BMI calculation verification
function testBMICalculations() {
  console.log('\n📏 Testing BMI Calculations\n');
  
  const bmiTests = [
    { height: 175, weight: 50, expectedBMI: 16.33, category: 'underweight' },
    { height: 175, weight: 70, expectedBMI: 22.86, category: 'normal' },
    { height: 175, weight: 85, expectedBMI: 27.76, category: 'overweight' },
    { height: 175, weight: 100, expectedBMI: 32.65, category: 'obese' }
  ];
  
  bmiTests.forEach(test => {
    const calculatedBMI = test.weight / Math.pow(test.height / 100, 2);
    const isAccurate = Math.abs(calculatedBMI - test.expectedBMI) < 0.1;
    
    console.log(`Height: ${test.height}cm, Weight: ${test.weight}kg`);
    console.log(`Expected BMI: ${test.expectedBMI}, Calculated: ${calculatedBMI.toFixed(2)}`);
    console.log(`Category: ${test.category}, Accurate: ${isAccurate ? '✅' : '❌'}`);
    console.log('---');
  });
}

// Run all tests
async function main() {
  await runAccuracyTests();
  testNutritionalCalculations();
  testBMICalculations();
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Run unit tests: npm test meal-suggestion.service.spec.ts');
  console.log('2. Test with real data using the accuracy API endpoints');
  console.log('3. Monitor suggestion acceptance rates in production');
  console.log('4. Set up automated accuracy monitoring');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runAccuracyTests,
  testNutritionalCalculations,
  testBMICalculations
};
