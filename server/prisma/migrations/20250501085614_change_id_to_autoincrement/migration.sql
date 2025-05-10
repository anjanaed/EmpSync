/*
  Warnings:

  - The primary key for the `Meal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Meal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `orderNumber` on the `Order` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Meal_id_key";

-- DropIndex
DROP INDEX "Order_orderNumber_key";

-- AlterTable
ALTER TABLE "Meal" DROP CONSTRAINT "Meal_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Meal_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "orderNumber",
ADD COLUMN     "breakfast" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dinner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lunch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "meals" TEXT[],
ADD COLUMN     "orderPlacedTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "orderDate" SET DATA TYPE DATE;
