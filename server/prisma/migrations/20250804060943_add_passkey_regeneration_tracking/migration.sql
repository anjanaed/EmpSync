-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passkeyRegeneratedAt" TIMESTAMP(3),
ADD COLUMN     "passkeyRegeneratedBy" TEXT;
