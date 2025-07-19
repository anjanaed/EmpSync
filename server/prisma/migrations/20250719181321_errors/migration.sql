/*
  Warnings:

  - You are about to drop the column `orgId` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `orgId` on the `Payroll` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ingredient" DROP COLUMN "orgId";

-- AlterTable
ALTER TABLE "Payroll" DROP COLUMN "orgId";
