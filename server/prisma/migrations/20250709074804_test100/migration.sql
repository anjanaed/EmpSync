/*
  Warnings:

  - You are about to drop the column `subscription` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `resource` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermissionToRole` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `orgId` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_A_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_B_fkey";

-- DropIndex
DROP INDEX "Permission_action_resource_key";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "subscription";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "resource",
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL;

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "_PermissionToRole";
