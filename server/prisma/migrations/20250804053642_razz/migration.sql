/*
  Warnings:

  - A unique constraint covering the columns `[orgId,orderId]` on the table `PayeTaxSlab` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empNo,organizationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PayeTaxSlab_orgId_orderId_key" ON "PayeTaxSlab"("orgId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "User_empNo_organizationId_key" ON "User"("empNo", "organizationId");
