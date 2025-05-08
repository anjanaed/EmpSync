/*
  Warnings:

  - The `breakfast` column on the `ScheduledMeal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lunch` column on the `ScheduledMeal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `dinner` column on the `ScheduledMeal` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ScheduledMeal" DROP COLUMN "breakfast",
ADD COLUMN     "breakfast" INTEGER[],
DROP COLUMN "lunch",
ADD COLUMN     "lunch" INTEGER[],
DROP COLUMN "dinner",
ADD COLUMN     "dinner" INTEGER[];
