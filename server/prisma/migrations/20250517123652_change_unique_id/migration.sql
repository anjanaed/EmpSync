/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `ScheduledMeal` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ScheduledMeal_date_key";

-- AlterTable
ALTER TABLE "ScheduledMeal" DROP COLUMN "updatedAt";
