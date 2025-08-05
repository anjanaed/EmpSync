# Meal Suggestion Service Accuracy Testing Guide

This guide provides comprehensive methods to validate the accuracy of your meal suggestion algorithm. The system uses BMI calculations, user preferences, and nutritional content to recommend meals.

## 🎯 Accuracy Testing Methods

### 1. **Unit Testing**
**Purpose**: Test individual components in isolation

**Files**: 
- `meal-suggestion.service.spec.ts` - Unit tests for the service
- `accuracy-validator.ts` - Manual validation script

**Run Tests**:
```bash
npm test meal-suggestion.service.spec.ts
```

**What it tests**:
- BMI calculation accuracy
- Nutritional computation correctness
- Preference matching logic
- Score consistency
- Edge case handling

### 2. **Manual Validation Script**
**Purpose**: Quick manual testing with known scenarios

**File**: `accuracy-validator.ts`

**Run Script**:
```bash
npx ts-node src/modules/meal/accuracy-validator.ts
```

**What it validates**:
- ✅ BMI calculations (16.33 for 50kg/175cm should be "underweight")
- ✅ Nutritional calculations (protein meals should have >30g protein)
- ✅ Preference matching (frequently ordered meals get higher scores)
- ✅ Score ranges (all scores between 0-1)
- ✅ Edge cases (missing data, extreme values)

### 3. **Real Data Cross-Validation**
**Purpose**: Test against historical user data

**Method**:
```typescript
// Use the accuracy service to test against past 3 months
const accuracyService = new MealSuggestionAccuracyService(databaseService);
const results = await accuracyService.crossValidate(3);

console.log('Accuracy:', results.accuracy);      // Should be >80%
console.log('Precision:', results.precision);    // Should be >75%
console.log('Recall:', results.recall);         // Should be >70%
```

**How it works**:
1. Takes historical orders from last X months
2. For each order, predicts what the user would have ordered
3. Compares predictions with actual orders
4. Calculates accuracy metrics

### 4. **A/B Testing**
**Purpose**: Compare algorithm versions in production

**Setup**:
```typescript
// Split users into two groups
const userGroup1 = ['user1', 'user2', ...]; // Current algorithm
const userGroup2 = ['user3', 'user4', ...]; // Modified algorithm

// Run for 1-2 weeks and compare:
const results = await accuracyService.runABTest(
  allUsers, 
  '2025-08-03', 
  1, // meal type
  14 // days
);
```

**Metrics to track**:
- **Suggestion Acceptance Rate**: % of suggestions actually ordered
- **User Satisfaction**: Ratings/feedback scores
- **Order Completion Rate**: % of users who complete orders
- **Repeat Usage**: % of users who return

### 5. **BMI Category Validation**
**Purpose**: Ensure recommendations match BMI needs

**Test API Endpoint**:
```bash
POST /meal-suggestions/accuracy/bmi-comparison
{
  "mealTypeId": 1,
  "date": "2025-08-03",
  "orgId": "optional"
}
```

**Expected Results**:
- **Underweight users** (BMI < 18.5): High-calorie, high-protein meals
- **Normal weight** (BMI 18.5-25): Balanced nutrition
- **Overweight** (BMI 25-30): Lower calories, higher fiber
- **Obese** (BMI > 30): Very low calories, high fiber, high protein

### 6. **Real-Time Monitoring**
**Purpose**: Continuous accuracy monitoring in production

**Monitoring Endpoint**:
```bash
GET /meal-suggestions/accuracy/monitoring?days=7
```

**Key Metrics**:
```json
{
  "suggestionAcceptanceRate": 0.65,  // Target: >60%
  "userSatisfactionScore": 4.2,      // Target: >4.0/5
  "bmiCategoryAccuracy": {
    "underweight": 0.78,             // Target: >75%
    "normal": 0.85,
    "overweight": 0.72,
    "obese": 0.69
  },
  "preferenceAccuracy": 0.73,        // Target: >70%
  "nutritionalAccuracy": 0.81        // Target: >80%
}
```

## 📊 Accuracy Benchmarks

### **Minimum Acceptable Accuracy Levels**:
- **Overall Accuracy**: >75%
- **BMI-based Recommendations**: >70%
- **Preference Matching**: >65%
- **Nutritional Calculations**: >80%
- **User Satisfaction**: >4.0/5.0

### **Excellent Performance Levels**:
- **Overall Accuracy**: >90%
- **BMI-based Recommendations**: >85%
- **Preference Matching**: >80%
- **Nutritional Calculations**: >95%
- **User Satisfaction**: >4.5/5.0

## 🔧 Calibration & Improvement

### **If BMI Accuracy is Low**:
1. Check BMI calculation formula
2. Verify nutritional database accuracy
3. Adjust scoring weights for different BMI categories
4. Add more detailed nutritional information

### **If Preference Accuracy is Low**:
1. Increase order history analysis period
2. Weight recent orders more heavily
3. Consider meal similarity algorithms
4. Add explicit user preference settings

### **If Nutritional Accuracy is Low**:
1. Update ingredient nutritional database
2. Add serving size considerations
3. Include cooking method effects
4. Consult with nutritionist for validation

## 🚀 Implementation Steps

### Step 1: Set Up Basic Testing
```bash
# 1. Run the manual validator
npx ts-node src/modules/meal/accuracy-validator.ts

# 2. Run unit tests
npm test meal-suggestion.service.spec.ts

# 3. Review results and fix any failing tests
```

### Step 2: Implement Real Data Testing
```typescript
// Add to your service or create a test script
async function testWithRealData() {
  const testUsers = await getUsersWithOrderHistory();
  
  for (const user of testUsers) {
    const suggestions = await mealSuggestionService.getMealSuggestions(
      user.id, 
      '2025-08-03', 
      1
    );
    
    // Validate suggestions make sense for this user's profile
    validateSuggestions(user, suggestions);
  }
}
```

### Step 3: Set Up Monitoring
```typescript
// Add to your production deployment
setInterval(async () => {
  const metrics = await accuracyService.getAccuracyMonitoring(7);
  
  if (metrics.suggestionAcceptanceRate < 0.5) {
    sendAlert('Low suggestion acceptance rate detected');
  }
  
  logMetrics(metrics);
}, 24 * 60 * 60 * 1000); // Daily monitoring
```

## 📝 Validation Checklist

### Before Production Deployment:
- [ ] All unit tests pass
- [ ] Manual validation tests pass
- [ ] BMI calculations verified
- [ ] Nutritional calculations validated
- [ ] Edge cases handled
- [ ] Performance tested with large datasets
- [ ] User feedback mechanism in place

### Regular Monitoring (Weekly):
- [ ] Check suggestion acceptance rates
- [ ] Review user satisfaction scores
- [ ] Analyze BMI category performance
- [ ] Monitor system performance
- [ ] Check for data quality issues

### Monthly Review:
- [ ] Run cross-validation analysis
- [ ] Review and update nutritional database
- [ ] Analyze user feedback trends
- [ ] Adjust algorithm parameters if needed
- [ ] Plan A/B tests for improvements

## 🔍 Debugging Common Issues

### Low Suggestion Acceptance:
1. Check if meals are actually available when suggested
2. Verify pricing and portion sizes are reasonable
3. Review suggestion reasons for clarity
4. Ensure dietary restrictions are considered

### Inconsistent BMI Recommendations:
1. Verify BMI calculation logic
2. Check nutritional database accuracy
3. Review scoring weight distribution
4. Test with known good/bad examples

### Poor Preference Matching:
1. Verify order history parsing
2. Check date range for order history
3. Review frequency calculation logic
4. Test with users who have clear preferences

Remember: **Accuracy is not just about mathematical correctness, but also about user satisfaction and real-world applicability!**
