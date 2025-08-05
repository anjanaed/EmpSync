-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactNumber" TEXT,
    "address" TEXT,
    "contactEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fingerprint" (
    "thumbid" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "empId" TEXT NOT NULL,

    CONSTRAINT "Fingerprint_pkey" PRIMARY KEY ("thumbid")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "empNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "dob" TEXT,
    "telephone" TEXT,
    "gender" "Gender" NOT NULL,
    "address" TEXT,
    "email" TEXT NOT NULL,
    "salary" INTEGER,
    "passkey" INTEGER,
    "passkeyRegeneratedBy" TEXT,
    "passkeyRegeneratedAt" TIMESTAMP(3),
    "supId" TEXT,
    "language" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" SERIAL NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" SERIAL NOT NULL,
    "orgId" TEXT NOT NULL,
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
    "id" SERIAL NOT NULL,
    "orgId" TEXT NOT NULL,
    "nameEnglish" TEXT NOT NULL,
    "nameSinhala" TEXT NOT NULL,
    "nameTamil" TEXT NOT NULL,
    "description" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealIngredient" (
    "id" SERIAL NOT NULL,
    "mealId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,

    CONSTRAINT "MealIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryAdjustments" (
    "id" SERIAL NOT NULL,
    "orgId" TEXT NOT NULL,
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
    "orgId" TEXT NOT NULL,
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
    "orgId" TEXT NOT NULL,
    "mealTypeId" INTEGER NOT NULL,
    "meals" TEXT[],
    "orderDate" DATE NOT NULL,
    "orderPlacedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DOUBLE PRECISION NOT NULL,
    "serve" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledMeal" (
    "id" SERIAL NOT NULL,
    "orgId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mealTypeId" INTEGER NOT NULL,

    CONSTRAINT "ScheduledMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayeTaxSlab" (
    "id" SERIAL NOT NULL,
    "orgId" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "lowerLimit" DOUBLE PRECISION NOT NULL,
    "upperLimit" DOUBLE PRECISION,
    "taxRate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PayeTaxSlab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "time" TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MealToScheduledMeal" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MealToScheduledMeal_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_empNo_organizationId_key" ON "User"("empNo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_permissionId_key" ON "UserPermission"("userId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payroll_id_month_key" ON "Payroll"("id", "month");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledMeal_date_mealTypeId_key" ON "ScheduledMeal"("date", "mealTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "PayeTaxSlab_orgId_orderId_key" ON "PayeTaxSlab"("orgId", "orderId");

-- CreateIndex
CREATE INDEX "_PermissionToUser_B_index" ON "_PermissionToUser"("B");

-- CreateIndex
CREATE INDEX "_MealToScheduledMeal_B_index" ON "_MealToScheduledMeal"("B");

-- AddForeignKey
ALTER TABLE "Fingerprint" ADD CONSTRAINT "Fingerprint_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_empId_fkey" FOREIGN KEY ("empId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealIngredient" ADD CONSTRAINT "MealIngredient_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealIngredient" ADD CONSTRAINT "MealIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAdjustments" ADD CONSTRAINT "SalaryAdjustments_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndividualSalaryAdjustments" ADD CONSTRAINT "IndividualSalaryAdjustments_empId_fkey" FOREIGN KEY ("empId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndividualSalaryAdjustments" ADD CONSTRAINT "IndividualSalaryAdjustments_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMeal" ADD CONSTRAINT "ScheduledMeal_mealTypeId_fkey" FOREIGN KEY ("mealTypeId") REFERENCES "MealType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMeal" ADD CONSTRAINT "ScheduledMeal_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayeTaxSlab" ADD CONSTRAINT "PayeTaxSlab_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealType" ADD CONSTRAINT "MealType_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToScheduledMeal" ADD CONSTRAINT "_MealToScheduledMeal_A_fkey" FOREIGN KEY ("A") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealToScheduledMeal" ADD CONSTRAINT "_MealToScheduledMeal_B_fkey" FOREIGN KEY ("B") REFERENCES "ScheduledMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
