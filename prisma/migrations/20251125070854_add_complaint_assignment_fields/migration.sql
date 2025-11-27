-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ComplaintCategory" ADD VALUE 'RENT';
ALTER TYPE "ComplaintCategory" ADD VALUE 'SINK';
ALTER TYPE "ComplaintCategory" ADD VALUE 'APPLIANCES';
ALTER TYPE "ComplaintCategory" ADD VALUE 'HEATING_COOLING';
ALTER TYPE "ComplaintCategory" ADD VALUE 'PEST_CONTROL';
ALTER TYPE "ComplaintCategory" ADD VALUE 'NOISE';

-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "assignedToName" TEXT,
ADD COLUMN     "assignedToPhone" TEXT,
ADD COLUMN     "closedAt" TIMESTAMP(3);
