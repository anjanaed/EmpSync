-- DropForeignKey
ALTER TABLE "ScheduledMeal" DROP CONSTRAINT "ScheduledMeal_mealTypeId_fkey";

-- AddForeignKey
ALTER TABLE "ScheduledMeal" ADD CONSTRAINT "ScheduledMeal_mealTypeId_fkey" FOREIGN KEY ("mealTypeId") REFERENCES "MealType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
