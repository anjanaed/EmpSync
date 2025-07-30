import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const MealDataContext = createContext();

export const useMealData = () => {
  const context = useContext(MealDataContext);
  if (!context) {
    throw new Error('useMealData must be used within a MealDataProvider');
  }
  return context;
};

export const MealDataProvider = ({ children }) => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  
  // State for meal data
  const [mealTimes, setMealTimes] = useState([[], []]);
  const [todayMeals, setTodayMeals] = useState({});
  const [tomorrowMeals, setTomorrowMeals] = useState({});
  const [allMeals, setAllMeals] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrganizationId, setCurrentOrganizationId] = useState(null);

  // Clear all data when organization changes or user logs out
  const clearData = useCallback(() => {
    setMealTimes([[], []]);
    setTodayMeals({});
    setTomorrowMeals({});
    setAllMeals([]);
    setIsDataLoaded(false);
    setIsLoading(false);
    setCurrentOrganizationId(null);
  }, []);

  // Preload meal data for a specific organization
  const preloadMealData = useCallback(async (organizationId, baseTime) => {
    if (!organizationId || !baseTime) {
      console.warn('Missing organizationId or baseTime for preloading');
      return;
    }

    // If data is already loaded for this organization, don't reload
    if (isDataLoaded && currentOrganizationId === organizationId) {
      console.log('Meal data already loaded for organization:', organizationId);
      return;
    }

    // If we're switching organizations, clear previous data
    if (currentOrganizationId !== organizationId) {
      clearData();
      setCurrentOrganizationId(organizationId);
    }

    setIsLoading(true);
    console.log('Preloading meal data for organization:', organizationId);

    try {
      // 1. Fetch meal times
      const mealTimesResponse = await axios.get(
        `${baseURL}/meal-types/fetch?orgId=${organizationId}`
      );
      const fetchedMealTimes = Array.isArray(mealTimesResponse.data) 
        ? mealTimesResponse.data 
        : [[], []];
      setMealTimes(fetchedMealTimes);

      // 2. Prepare dates
      const today = new Date(baseTime);
      const tomorrow = new Date(baseTime.getTime() + 24 * 60 * 60 * 1000);
      const todayFormatted = today.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      const tomorrowFormatted = tomorrow.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });

      // 3. Fetch meals for both days in parallel
      const [todayScheduleResponse, tomorrowScheduleResponse] = await Promise.all([
        axios.get(`${baseURL}/schedule/${todayFormatted}?orgId=${organizationId}`),
        axios.get(`${baseURL}/schedule/${tomorrowFormatted}?orgId=${organizationId}`)
      ]);

      // 4. Process today's meals
      const todayScheduleData = Array.isArray(todayScheduleResponse.data) 
        ? todayScheduleResponse.data 
        : [];
      const todayMealsByType = {};
      const collectedMeals = [];

      todayScheduleData.forEach(scheduleEntry => {
        const mealTypeId = scheduleEntry.mealTypeId || scheduleEntry.mealType?.id;
        if (mealTypeId && scheduleEntry.meals && Array.isArray(scheduleEntry.meals)) {
          todayMealsByType[mealTypeId] = scheduleEntry.meals;
          collectedMeals.push(...scheduleEntry.meals);
        }
      });

      // 5. Process tomorrow's meals
      const tomorrowScheduleData = Array.isArray(tomorrowScheduleResponse.data) 
        ? tomorrowScheduleResponse.data 
        : [];
      const tomorrowMealsByType = {};

      tomorrowScheduleData.forEach(scheduleEntry => {
        const mealTypeId = scheduleEntry.mealTypeId || scheduleEntry.mealType?.id;
        if (mealTypeId && scheduleEntry.meals && Array.isArray(scheduleEntry.meals)) {
          tomorrowMealsByType[mealTypeId] = scheduleEntry.meals;
          collectedMeals.push(...scheduleEntry.meals);
        }
      });

      // 6. Remove duplicate meals and update state
      const uniqueMeals = collectedMeals.filter((meal, index, self) => 
        index === self.findIndex(m => m.id === meal.id)
      );

      setTodayMeals(todayMealsByType);
      setTomorrowMeals(tomorrowMealsByType);
      setAllMeals(uniqueMeals);
      setIsDataLoaded(true);

      console.log('Meal data preloaded successfully:', {
        organizationId,
        mealTimesCount: fetchedMealTimes[0].length + fetchedMealTimes[1].length,
        todayMealTypes: Object.keys(todayMealsByType).length,
        tomorrowMealTypes: Object.keys(tomorrowMealsByType).length,
        totalUniqueMeals: uniqueMeals.length
      });

    } catch (error) {
      console.error('Error preloading meal data:', error);
      // Keep existing data but mark as not loading
    } finally {
      setIsLoading(false);
    }
  }, [baseURL, isDataLoaded, currentOrganizationId, clearData]);

  // Get meals for a specific date and meal type
  const getMealsForType = useCallback((date, mealTypeId) => {
    const mealsData = date === 'today' ? todayMeals : tomorrowMeals;
    return mealsData[mealTypeId] || [];
  }, [todayMeals, tomorrowMeals]);

  // Get available meal times for a specific date
  const getAvailableMealTimes = useCallback((date) => {
    return date === 'today' ? mealTimes[0] : mealTimes[1];
  }, [mealTimes]);

  const value = {
    // Data
    mealTimes,
    todayMeals,
    tomorrowMeals,
    allMeals,
    isDataLoaded,
    isLoading,
    currentOrganizationId,
    
    // Actions
    preloadMealData,
    clearData,
    getMealsForType,
    getAvailableMealTimes,
  };

  return (
    <MealDataContext.Provider value={value}>
      {children}
    </MealDataContext.Provider>
  );
};
