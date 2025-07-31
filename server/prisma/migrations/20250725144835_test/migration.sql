/*
  Warnings:

  - You are about to drop the column `active` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `fingerprint_capacity` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `fingerprint_per_machine` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "active",
DROP COLUMN "fingerprint_capacity",
DROP COLUMN "fingerprint_per_machine",
DROP COLUMN "logoUrl",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "contactNumber" TEXT;
