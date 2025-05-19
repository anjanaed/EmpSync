/*
  Warnings:

  - The `time` column on the `MealType` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "MealType" DROP COLUMN "time",
ADD COLUMN     "time" TEXT[];
