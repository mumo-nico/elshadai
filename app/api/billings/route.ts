import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/billings - Get monthly billing data for all tenants
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const tenantId = searchParams.get("tenantId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Get current month and year if not specified
    const now = new Date();
    const currentMonth = month || (now.getMonth() + 1).toString();
    const currentYear = year || now.getFullYear().toString();

    // Build where clause for tenants
    const where: any = {
      status: "ACTIVE",
    };

    if (propertyId && propertyId !== "all") {
      where.unit = {
        propertyId: propertyId,
      };
    }

    if (tenantId && tenantId !== "all") {
      where.userId = tenantId;
    }

    // Get all active tenants with their units
    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // For each tenant, calculate payments for the specified month/year
    const billingData = await Promise.all(
      tenants.map(async (tenant) => {
        let amountPaid = 0;
        let status = "NOT_PAID";

        // If month and year are specified (not "all")
        if (month !== "all" && year !== "all") {
          // Get the start and end of the specified month
          const startDate = new Date(parseInt(currentYear), parseInt(currentMonth) - 1, 1);
          const endDate = new Date(parseInt(currentYear), parseInt(currentMonth), 0, 23, 59, 59);

          // Get all approved payments for this tenant and unit in this month
          const payments = await prisma.payment.findMany({
            where: {
              userId: tenant.userId,
              unitId: tenant.unitId,
              isApproved: true,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          });

          amountPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

          // Determine status
          if (amountPaid === 0) {
            status = "NOT_PAID";
          } else if (amountPaid >= tenant.monthlyRent) {
            status = "FULLY_PAID";
          } else {
            status = "PARTIALLY_PAID";
          }
        } else {
          // For "all" months/years, show total paid and current rent due
          const allPayments = await prisma.payment.findMany({
            where: {
              userId: tenant.userId,
              unitId: tenant.unitId,
              isApproved: true,
            },
          });

          amountPaid = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
          
          // Status based on current rent due
          if (tenant.rentDue === 0) {
            status = "FULLY_PAID";
          } else if (tenant.rentDue < tenant.monthlyRent) {
            status = "PARTIALLY_PAID";
          } else {
            status = "NOT_PAID";
          }
        }

        return {
          tenantId: tenant.tenantId,
          tenantName: tenant.user.name,
          tenantEmail: tenant.user.email,
          propertyName: tenant.unit.property.name,
          unitNumber: tenant.unit.unitNumber,
          monthlyRent: tenant.monthlyRent,
          amountPaid,
          status,
          rentDue: tenant.rentDue,
        };
      })
    );

    return NextResponse.json(billingData);
  } catch (error) {
    console.error("Error fetching billing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing data" },
      { status: 500 }
    );
  }
}

