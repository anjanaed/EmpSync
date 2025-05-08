/*
  Warnings:

  - The primary key for the `Meal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Meal` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Meal" DROP CONSTRAINT "Meal_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Meal_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Meal_id_seq";

-- AlterTable
ALTER TABLE "ScheduledMeal" ALTER COLUMN "breakfast" SET DATA TYPE TEXT[],
ALTER COLUMN "lunch" SET DATA TYPE TEXT[],
ALTER COLUMN "dinner" SET DATA TYPE TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Meal_id_key" ON "Meal"("id");
