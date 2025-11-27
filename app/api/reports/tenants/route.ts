import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/reports/tenants - Get tenants report with units and cumulative rent
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Get all active tenants
    const tenants = await prisma.tenant.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                name: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: {
        leaseStartDate: "desc",
      },
    });

    // Calculate cumulative rent for each tenant
    const tenantsWithRent = await Promise.all(
      tenants.map(async (tenant) => {
        // Use the rentDue field from tenant record (for rollover scenarios)
        // This allows landlords to set initial balances when rolling over the system
        const rentDue = tenant.rentDue || 0;

        // Get total payments made (for display purposes)
        const payments = await prisma.payment.findMany({
          where: {
            unitId: tenant.unitId,
            userId: tenant.userId,
            isApproved: true,
            ...(dateFrom && dateTo
              ? {
                  createdAt: {
                    gte: new Date(dateFrom),
                    lte: new Date(dateTo),
                  },
                }
              : {}),
          },
        });

        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

        return {
          id: tenant.id,
          tenantId: tenant.tenantId,
          name: tenant.user.name,
          email: tenant.user.email,
          phone: tenant.user.phone,
          unit: {
            unitNumber: tenant.unit.unitNumber,
            unitType: tenant.unit.unitType,
            property: tenant.unit.property.name,
            location: tenant.unit.property.location,
            monthlyRent: tenant.monthlyRent,
          },
          moveInDate: tenant.leaseStartDate,
          totalRentDue: rentDue + totalPaid, // Total that should have been paid
          totalPaid,
          rentDue,
          status: tenant.status,
        };
      })
    );

    return NextResponse.json(tenantsWithRent);
  } catch (error) {
    console.error("Error fetching tenants report:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants report" },
      { status: 500 }
    );
  }
}

