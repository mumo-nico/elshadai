import { prisma } from "./prisma";

/**
 * Generate custom IDs for different entities
 * Format: PREFIX-NNNNN (e.g., ELSTNT-00001, ELSPMT-00001, ELRPT-00001)
 */

export async function generateTenantId(): Promise<string> {
  const prefix = "ELSTNT";
  
  // Get the latest tenant with a custom ID
  const latestTenant = await prisma.tenant.findFirst({
    where: {
      tenantId: {
        startsWith: prefix,
      },
    },
    orderBy: {
      tenantId: "desc",
    },
  });

  let nextNumber = 1;
  if (latestTenant?.tenantId) {
    const currentNumber = parseInt(latestTenant.tenantId.split("-")[1]);
    nextNumber = currentNumber + 1;
  }

  return `${prefix}-${nextNumber.toString().padStart(5, "0")}`;
}

export async function generatePaymentId(): Promise<string> {
  const prefix = "ELSPMT";
  
  // Get the latest payment with a custom ID
  const latestPayment = await prisma.payment.findFirst({
    where: {
      paymentId: {
        startsWith: prefix,
      },
    },
    orderBy: {
      paymentId: "desc",
    },
  });

  let nextNumber = 1;
  if (latestPayment?.paymentId) {
    const currentNumber = parseInt(latestPayment.paymentId.split("-")[1]);
    nextNumber = currentNumber + 1;
  }

  return `${prefix}-${nextNumber.toString().padStart(5, "0")}`;
}

export async function generateComplaintId(): Promise<string> {
  const prefix = "ELRPT";
  
  // Get the latest complaint with a custom ID
  const latestComplaint = await prisma.complaint.findFirst({
    where: {
      complaintId: {
        startsWith: prefix,
      },
    },
    orderBy: {
      complaintId: "desc",
    },
  });

  let nextNumber = 1;
  if (latestComplaint?.complaintId) {
    const currentNumber = parseInt(latestComplaint.complaintId.split("-")[1]);
    nextNumber = currentNumber + 1;
  }

  return `${prefix}-${nextNumber.toString().padStart(5, "0")}`;
}

