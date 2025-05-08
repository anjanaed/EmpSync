/*
  Warnings:

  - The `category` column on the `Meal` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Meal" DROP COLUMN "category",
ADD COLUMN     "category" TEXT[];
