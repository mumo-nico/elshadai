import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/reports/units - Get units report with tenants and rent due
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Get all units with their current tenants
    const units = await prisma.unit.findMany({
      include: {
        property: {
          select: {
            name: true,
            location: true,
          },
        },
        tenants: {
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
          },
        },
      },
      orderBy: {
        unitNumber: "asc",
      },
    });

    // Calculate rent due for each unit
    const unitsWithRentDue = await Promise.all(
      units.map(async (unit) => {
        const tenant = unit.tenants[0]; // Get active tenant

        if (!tenant) {
          return {
            id: unit.id,
            unitNumber: unit.unitNumber,
            unitType: unit.unitType,
            property: unit.property.name,
            location: unit.property.location,
            monthlyRent: unit.rent,
            status: unit.status,
            tenant: null,
            rentDue: 0,
            rentPaid: 0,
          };
        }

        // Use the rentDue field from tenant record (for rollover scenarios)
        // This allows landlords to set initial balances when rolling over the system
        const rentDue = tenant.rentDue || 0;

        // Get total payments made (for display purposes)
        const payments = await prisma.payment.findMany({
          where: {
            unitId: unit.id,
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
          id: unit.id,
          unitNumber: unit.unitNumber,
          unitType: unit.unitType,
          property: unit.property.name,
          location: unit.property.location,
          monthlyRent: tenant.monthlyRent,
          status: unit.status,
          tenant: tenant
            ? {
                name: tenant.user.name,
                email: tenant.user.email,
                phone: tenant.user.phone,
                moveInDate: tenant.leaseStartDate,
              }
            : null,
          rentDue,
          rentPaid: totalPaid,
        };
      })
    );

    return NextResponse.json(unitsWithRentDue);
  } catch (error) {
    console.error("Error fetching units report:", error);
    return NextResponse.json(
      { error: "Failed to fetch units report" },
      { status: 500 }
    );
  }
}

