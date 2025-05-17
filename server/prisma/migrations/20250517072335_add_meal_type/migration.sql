/*
  Warnings:

  - You are about to drop the `Reports` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
CREATE SEQUENCE budget_id_seq;
ALTER TABLE "Budget" ALTER COLUMN "id" SET DEFAULT nextval('budget_id_seq');
ALTER SEQUENCE budget_id_seq OWNED BY "Budget"."id";

-- DropTable
DROP TABLE "Reports";

-- CreateTable
CREATE TABLE "MealType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" DOUBLE PRECISION NOT NULL,
    "isDefault" BOOLEAN NOT NULL,

    CONSTRAINT "MealType_pkey" PRIMARY KEY ("id")
);
