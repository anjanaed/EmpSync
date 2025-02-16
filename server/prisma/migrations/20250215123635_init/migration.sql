-- CreateTable
CREATE TABLE "LeaveApplication" (
    "id" SERIAL NOT NULL,
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" DOUBLE PRECISION NOT NULL,
    "empId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT NOT NULL,

    CONSTRAINT "LeaveApplication_pkey" PRIMARY KEY ("id")
);
