/*
  Warnings:

  - The primary key for the `Meal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Meal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `name` to the `Budget` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `mealId` on the `MealIngredient` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "MealIngredient" DROP CONSTRAINT "MealIngredient_mealId_fkey";

-- DropIndex
DROP INDEX "Meal_id_key";

-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Budget_id_seq";

-- AlterTable
ALTER TABLE "Meal" DROP CONSTRAINT "Meal_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Meal_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MealIngredient" DROP COLUMN "mealId",
ADD COLUMN     "mealId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "MealIngredient" ADD CONSTRAINT "MealIngredient_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
