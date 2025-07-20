/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Made the column `orgId` on table `Fingerprint` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orgId` on table `IndividualSalaryAdjustments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orgId` on table `Ingredient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orgId` on table `Meal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orgId` on table `MealType` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orgId` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orgId` on table `PayeTaxSlab` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orgId` on table `Payroll` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orgId` on table `SalaryAdjustments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orgId` on table `ScheduledMeal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";

-- AlterTable
ALTER TABLE "Fingerprint" ALTER COLUMN "orgId" SET NOT NULL;

-- AlterTable
ALTER TABLE "IndividualSalaryAdjustments" ALTER COLUMN "orgId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Ingredient" ALTER COLUMN "orgId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Meal" ALTER COLUMN "orgId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MealType" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "orgId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "orgId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PayeTaxSlab" ALTER COLUMN "orgId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Payroll" ALTER COLUMN "orgId" SET NOT NULL;

-- AlterTable
ALTER TABLE "SalaryAdjustments" ALTER COLUMN "orgId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ScheduledMeal" ALTER COLUMN "orgId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
