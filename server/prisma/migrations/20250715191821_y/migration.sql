/*
  Warnings:

  - You are about to drop the `Budget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IngredientOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderIngredient` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderIngredient" DROP CONSTRAINT "OrderIngredient_orderId_fkey";

-- AlterTable
ALTER TABLE "Fingerprint" ADD COLUMN     "orgId" TEXT;

-- AlterTable
ALTER TABLE "IndividualSalaryAdjustments" ADD COLUMN     "orgId" TEXT;

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "orgId" TEXT;

-- AlterTable
ALTER TABLE "Meal" ADD COLUMN     "orgId" TEXT;

-- AlterTable
ALTER TABLE "MealType" ADD COLUMN     "orgId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orgId" TEXT;

-- AlterTable
ALTER TABLE "PayeTaxSlab" ADD COLUMN     "orgId" TEXT;

-- AlterTable
ALTER TABLE "Payroll" ADD COLUMN     "orgId" TEXT;

-- AlterTable
ALTER TABLE "SalaryAdjustments" ADD COLUMN     "orgId" TEXT;

-- AlterTable
ALTER TABLE "ScheduledMeal" ADD COLUMN     "orgId" TEXT;

-- DropTable
DROP TABLE "Budget";

-- DropTable
DROP TABLE "IngredientOrder";

-- DropTable
DROP TABLE "OrderIngredient";
