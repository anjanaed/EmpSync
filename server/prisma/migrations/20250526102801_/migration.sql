/*
  Warnings:

  - You are about to drop the column `breakfast` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `dinner` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `lunch` on the `Order` table. All the data in the column will be lost.
  - Added the required column `mealTypeId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "breakfast",
DROP COLUMN "dinner",
DROP COLUMN "lunch",
ADD COLUMN     "mealTypeId" INTEGER NOT NULL,
ALTER COLUMN "orderDate" DROP DEFAULT,
ALTER COLUMN "orderDate" SET DATA TYPE TIMESTAMP(3);
