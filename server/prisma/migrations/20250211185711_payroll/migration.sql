-- AlterTable
ALTER TABLE "User" ALTER COLUMN "dob" DROP NOT NULL,
ALTER COLUMN "telephone" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Payroll" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "payrollPdf" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payroll_id_key" ON "Payroll"("id");
