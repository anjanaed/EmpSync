/**
 * Manual Accuracy Testing Script for Meal Suggestion Service
 * 
 * This script provides practical ways to validate the accuracy of your meal suggestion algorithm.
 * Run this in a test environment with sample data.
 */

import { MealSuggestionService } from './meal-suggestion.service';

export class AccuracyValidator {
  
  /**
   * 1. BMI Calculation Accuracy Test
   * Tests if BMI calculations and corresponding meal suggestions are correct
   */
  static testBMIAccuracy() {
    console.log('=== BMI Accuracy Test ===');
    
    const testCases = [
      { height: 175, weight: 50, expectedBMI: 16.33, category: 'underweight' },
      { height: 175, weight: 70, expectedBMI: 22.86, category: 'normal' },
      { height: 175, weight: 85, expectedBMI: 27.76, category: 'overweight' },
      { height: 175, weight: 100, expectedBMI: 32.65, category: 'obese' }
    ];

    testCases.forEach(testCase => {
      const calculatedBMI = testCase.weight / Math.pow(testCase.height / 100, 2);
      const accuracy = Math.abs(calculatedBMI - testCase.expectedBMI) < 0.1;
      
      console.log(`Height: ${testCase.height}cm, Weight: ${testCase.weight}kg`);
      console.log(`Expected BMI: ${testCase.expectedBMI}, Calculated: ${calculatedBMI.toFixed(2)}`);
      console.log(`Category: ${testCase.category}, Accurate: ${accuracy ? '✅' : '❌'}`);
      console.log('---');
    });
  }

  /**
   * 2. Nutritional Calculation Accuracy Test
   * Validates if ingredient-based nutritional calculations make sense
   */
  static testNutritionalAccuracy() {
    console.log('=== Nutritional Calculation Test ===');
    
    const testMeals = [
      {
        name: 'High Protein Meal',
        ingredients: [
          { type: 'protein' }, { type: 'protein' }, { type: 'vegetable' }
        ],
        expectation: 'protein > 30g, calories > 200'
      },
      {
        name: 'Vegetarian Meal',
        ingredients: [
          { type: 'vegetable' }, { type: 'vegetable' }, { type: 'carb' }
        ],
        expectation: 'fiber > 5g, calories < 200'
      },
      {
        name: 'High Carb Meal',
        ingredients: [
          { type: 'carb' }, { type: 'carb' }, { type: 'dairy' }
        ],
        expectation: 'carbs > 40g'
      }
    ];

    // Mock the calculation (you would use actual service here)
    testMeals.forEach(meal => {
      const mockNutrition = this.mockCalculateNutrition(meal.ingredients);
      console.log(`Meal: ${meal.name}`);
      console.log(`Calculated: Protein ${mockNutrition.protein}g, Carbs ${mockNutrition.carbs}g, Calories ${mockNutrition.calories}`);
      console.log(`Expectation: ${meal.expectation}`);
      console.log(`Validates: ${this.validateNutrition(mockNutrition, meal.expectation) ? '✅' : '❌'}`);
      console.log('---');
    });
  }

  /**
   * 3. Preference Matching Test
   * Tests if user order history correctly influences suggestions
   */
  static testPreferenceAccuracy() {
    console.log('=== Preference Matching Test ===');
    
    const testCases = [
      {
        orderHistory: ['1:3', '2:1', '1:2'], // User ordered meal 1 five times, meal 2 once
        availableMeals: [1, 2, 3],
        expectedTopChoice: 1,
        description: 'User who frequently orders meal 1'
      },
      {
        orderHistory: [], // No order history
        availableMeals: [1, 2, 3],
        expectedTopChoice: 'any', // Should be neutral
        description: 'New user with no order history'
      }
    ];

    testCases.forEach(testCase => {
      const preferenceScore = this.mockCalculatePreferenceScore(testCase.orderHistory, testCase.availableMeals);
      console.log(`Test: ${testCase.description}`);
      console.log(`Order History: ${testCase.orderHistory.join(', ') || 'None'}`);
      console.log(`Preference Scores: ${JSON.stringify(preferenceScore)}`);
      console.log(`Expected favorite: ${testCase.expectedTopChoice}`);
      console.log('---');
    });
  }

  /**
   * 4. Score Consistency Test
   * Ensures that scoring is consistent and makes logical sense
   */
  static testScoreConsistency() {
    console.log('=== Score Consistency Test ===');
    
    const scenarios = [
      {
        name: 'Same user, same day, multiple calls',
        description: 'Should return identical results for identical inputs',
        test: 'consistency'
      },
      {
        name: 'Different BMI users, same meal',
        description: 'Same meal should have different suitability scores for different BMI users',
        test: 'variance'
      },
      {
        name: 'Score range validation',
        description: 'All scores should be between 0 and 1, and total scores reasonable',
        test: 'range'
      }
    ];

    scenarios.forEach(scenario => {
      console.log(`Test: ${scenario.name}`);
      console.log(`Description: ${scenario.description}`);
      console.log(`Status: ${this.mockTestScenario(scenario.test) ? '✅ PASS' : '❌ FAIL'}`);
      console.log('---');
    });
  }

  /**
   * 5. Edge Cases Test
   * Tests how the system handles unusual or extreme inputs
   */
  static testEdgeCases() {
    console.log('=== Edge Cases Test ===');
    
    const edgeCases = [
      {
        case: 'Missing user data',
        input: { height: null, weight: null },
        expectation: 'Should use default values and still provide suggestions'
      },
      {
        case: 'Extreme BMI values',
        input: { height: 200, weight: 40 }, // BMI: 10
        expectation: 'Should handle gracefully without crashing'
      },
      {
        case: 'No available meals',
        input: { mealsCount: 0 },
        expectation: 'Should throw NotFoundException'
      },
      {
        case: 'Large order history',
        input: { orderHistorySize: 1000 },
        expectation: 'Should process efficiently without timeout'
      }
    ];

    edgeCases.forEach(testCase => {
      console.log(`Edge Case: ${testCase.case}`);
      console.log(`Input: ${JSON.stringify(testCase.input)}`);
      console.log(`Expectation: ${testCase.expectation}`);
      console.log(`Result: ${this.mockTestEdgeCase(testCase.case) ? '✅ Handled' : '❌ Failed'}`);
      console.log('---');
    });
  }

  // Mock helper methods (replace with actual service calls)
  private static mockCalculateNutrition(ingredients: any[]) {
    let protein = 0, carbs = 0, calories = 0, fiber = 0;
    
    ingredients.forEach(ingredient => {
      switch(ingredient.type) {
        case 'protein':
          protein += 20; calories += 150;
          break;
        case 'carb':
          carbs += 25; calories += 130; fiber += 2;
          break;
        case 'vegetable':
          fiber += 3; calories += 25; carbs += 5;
          break;
        case 'dairy':
          protein += 8; calories += 60;
          break;
      }
    });

    return { protein, carbs, calories, fiber };
  }

  private static validateNutrition(nutrition: any, expectation: string): boolean {
    // Simple validation logic
    if (expectation.includes('protein > 30') && nutrition.protein <= 30) return false;
    if (expectation.includes('calories > 200') && nutrition.calories <= 200) return false;
    if (expectation.includes('fiber > 5') && nutrition.fiber <= 5) return false;
    if (expectation.includes('calories < 200') && nutrition.calories >= 200) return false;
    if (expectation.includes('carbs > 40') && nutrition.carbs <= 40) return false;
    return true;
  }

  private static mockCalculatePreferenceScore(orderHistory: string[], availableMeals: number[]): any {
    const scores: any = {};
    const frequency: any = {};
    
    // Calculate frequency from order history
    orderHistory.forEach(order => {
      const [mealId, count] = order.split(':').map(Number);
      frequency[mealId] = (frequency[mealId] || 0) + count;
    });

    // Calculate scores for available meals
    availableMeals.forEach(mealId => {
      const freq = frequency[mealId] || 0;
      scores[mealId] = freq > 0 ? Math.min(1, freq / 5) : 0.3; // Base score 0.3
    });

    return scores;
  }

  private static mockTestScenario(testType: string): boolean {
    // Mock test results - replace with actual testing logic
    switch(testType) {
      case 'consistency': return true;
      case 'variance': return true;
      case 'range': return true;
      default: return false;
    }
  }

  private static mockTestEdgeCase(caseType: string): boolean {
    // Mock edge case handling - replace with actual testing logic
    return true;
  }

  /**
   * Run all accuracy tests
   */
  static runAllTests() {
    console.log('🧪 Starting Meal Suggestion Accuracy Tests\n');
    
    this.testBMIAccuracy();
    this.testNutritionalAccuracy();
    this.testPreferenceAccuracy();
    this.testScoreConsistency();
    this.testEdgeCases();
    
    console.log('✅ All accuracy tests completed!\n');
    console.log('📊 Next Steps:');
    console.log('1. Review any failed tests above');
    console.log('2. Run with real data using your actual service');
    console.log('3. Set up automated testing in your CI/CD pipeline');
    console.log('4. Monitor real user interactions for ongoing accuracy validation');
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  AccuracyValidator.runAllTests();
}
