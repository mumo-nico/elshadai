/*
  Warnings:

  - A unique constraint covering the columns `[complaintId]` on the table `complaints` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "complaintId" TEXT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "paymentId" TEXT;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "tenantId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "complaints_complaintId_key" ON "complaints"("complaintId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentId_key" ON "payments"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_tenantId_key" ON "tenants"("tenantId");
