/*
  Warnings:

  - You are about to drop the column `price_per_unit` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Ingredient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ingredient" DROP COLUMN "price_per_unit",
DROP COLUMN "priority",
DROP COLUMN "quantity",
DROP COLUMN "type";
