-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "dob" TEXT,
    "telephone" TEXT,
    "gender" TEXT,
    "address" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salary" INTEGER,
    "thumbId" BYTEA,
    "supId" TEXT,
    "language" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price_per_unit" DECIMAL(10,2) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientOrder" (
    "id" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "budget" DOUBLE PRECISION,
    "priority1Budget" DOUBLE PRECISION,
    "otherPriorityBudget" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,

    CONSTRAINT "IngredientOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderIngredient" (
    "id" TEXT NOT NULL,
    "ingredientId" INTEGER,
    "name" TEXT NOT NULL,
    "price_per_unit" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "OrderIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "budgetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "budgetAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" SERIAL NOT NULL,
    "empId" TEXT NOT NULL,
    "range" TIMESTAMP(3)[],
    "month" TEXT NOT NULL,
    "netPay" DOUBLE PRECISION NOT NULL,
    "payrollPdf" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "nameEnglish" TEXT NOT NULL,
    "nameSinhala" TEXT NOT NULL,
    "nameTamil" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "ingredients" TEXT[],
    "category" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "employeeId" TEXT NOT NULL,
    "meals" TEXT[],
    "orderDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderPlacedTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "breakfast" BOOLEAN NOT NULL DEFAULT false,
    "lunch" BOOLEAN NOT NULL DEFAULT false,
    "dinner" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION NOT NULL,
    "serve" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "ScheduledMeal" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "breakfast" TEXT[],
    "lunch" TEXT[],
    "dinner" TEXT[],
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledMeal_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "Reports" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "requestStatus" BOOLEAN NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "Reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_thumbId_key" ON "User"("thumbId");

-- CreateIndex
CREATE UNIQUE INDEX "Meal_id_key" ON "Meal"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledMeal_date_key" ON "ScheduledMeal"("date");

-- AddForeignKey
ALTER TABLE "OrderIngredient" ADD CONSTRAINT "OrderIngredient_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "IngredientOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_empId_fkey" FOREIGN KEY ("empId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_empId_fkey" FOREIGN KEY ("empId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
