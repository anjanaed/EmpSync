/*
  Warnings:

  - You are about to drop the column `date` on the `MealType` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `MealType` table. All the data in the column will be lost.
  - You are about to drop the column `breakfast` on the `ScheduledMeal` table. All the data in the column will be lost.
  - You are about to drop the column `confirmed` on the `ScheduledMeal` table. All the data in the column will be lost.
  - You are about to drop the column `dinner` on the `ScheduledMeal` table. All the data in the column will be lost.
  - You are about to drop the column `lunch` on the `ScheduledMeal` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date,mealTypeId]` on the table `ScheduledMeal` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mealTypeId` to the `ScheduledMeal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ScheduledMeal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MealType" DROP COLUMN "date",
DROP COLUMN "duration",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "time" TEXT,
ALTER COLUMN "isDefault" SET DEFAULT false;

-- AlterTable
ALTER TABLE "ScheduledMeal" DROP COLUMN "breakfast",
DROP COLUMN "confirmed",
DROP COLUMN "dinner",
DROP COLUMN "lunch",
ADD COLUMN     "mealTypeId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "_MealToScheduledMeal" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MealToScheduledMeal_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MealToScheduledMeal_B_index" ON "_MealToScheduledMeal"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledMeal_date_mealTypeId_key" ON "ScheduledMeal"("date", "mealTypeId");

-- AddForeignKey
ALTER TABLE "ScheduledMeal" ADD CONSTRAINT "ScheduledMeal_mealTypeId_fkey" FOREIGN KEY ("mealTypeId") REFERENCES "MealType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToScheduledMeal" ADD CONSTRAINT "_MealToScheduledMeal_A_fkey" FOREIGN KEY ("A") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToScheduledMeal" ADD CONSTRAINT "_MealToScheduledMeal_B_fkey" FOREIGN KEY ("B") REFERENCES "ScheduledMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
