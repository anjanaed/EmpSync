/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ScheduledMeal` table. All the data in the column will be lost.
  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeaveApplication` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_empId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "orderDate" SET DATA TYPE DATE,
ALTER COLUMN "orderPlacedTime" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ScheduledMeal" DROP COLUMN "createdAt";

-- DropTable
DROP TABLE "Attendance";

-- DropTable
DROP TABLE "LeaveApplication";
