-- DropForeignKey
ALTER TABLE "MealIngredient" DROP CONSTRAINT "MealIngredient_mealId_fkey";

-- CreateTable
CREATE TABLE "Reports" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "requestStatus" BOOLEAN NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "Reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MealIngredient" ADD CONSTRAINT "MealIngredient_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
