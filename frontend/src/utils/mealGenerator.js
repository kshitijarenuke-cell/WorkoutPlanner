import { mealDatabase } from "../data/mealDatabase";

export const getDailyMealPlan = (goal) => {
  // 1. Get current day of the week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
  const todayIndex = new Date().getDay(); 

  // 2. Select the plan based on goal (fallback to Balanced if error)
  const plan = mealDatabase[goal] || mealDatabase["Balanced"];

  // 3. Pick the meal corresponding to the day index
  // The modulo operator (%) ensures that even if days shift, it loops safely.
  return {
    breakfast: plan.breakfast[todayIndex % plan.breakfast.length],
    lunch: plan.lunch[todayIndex % plan.lunch.length],
    snack: plan.snack[todayIndex % plan.snack.length],
    dinner: plan.dinner[todayIndex % plan.dinner.length],
    goal: goal
  };
};