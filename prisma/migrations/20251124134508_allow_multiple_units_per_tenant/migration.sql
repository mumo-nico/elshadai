/*
  Warnings:

  - A unique constraint covering the columns `[userId,unitId]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tenants_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "tenants_userId_unitId_key" ON "tenants"("userId", "unitId");
