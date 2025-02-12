-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);
