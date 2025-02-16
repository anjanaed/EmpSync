/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `ScheduledMeal` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ScheduledMeal" ALTER COLUMN "date" SET DATA TYPE DATE;

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledMeal_date_key" ON "ScheduledMeal"("date");
