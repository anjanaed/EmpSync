/*
  Warnings:

  - The primary key for the `Payroll` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Payroll` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `netPay` to the `Payroll` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Payroll_id_key";

-- DropIndex
DROP INDEX "User_name_key";

-- AlterTable
ALTER TABLE "Payroll" DROP CONSTRAINT "Payroll_pkey",
ADD COLUMN     "netPay" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "range" TIMESTAMP(3)[],
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "payrollPdf" SET DATA TYPE TEXT,
ADD CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "SalaryAdjustments" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "isPercentage" BOOLEAN NOT NULL,
    "allowance" BOOLEAN NOT NULL,
    "amount" DOUBLE PRECISION,

    CONSTRAINT "SalaryAdjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndividualSalaryAdjustments" (
    "id" SERIAL NOT NULL,
    "empId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isPercentage" BOOLEAN NOT NULL,
    "allowance" BOOLEAN NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "IndividualSalaryAdjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayeTaxSlab" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "lowerLimit" DOUBLE PRECISION NOT NULL,
    "upperLimit" DOUBLE PRECISION,
    "taxRate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PayeTaxSlab_pkey" PRIMARY KEY ("id")
);
