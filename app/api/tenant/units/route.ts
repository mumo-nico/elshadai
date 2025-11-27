import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/tenant/units - Get units for logged-in tenant (their units + available units)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TENANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const forPayment = searchParams.get("forPayment") === "true";

    // Get tenant's assigned units
    const tenantAssignments = await prisma.tenant.findMany({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

    // If this is for payment modal, return simplified format
    if (forPayment) {
      const myUnitsWithRent = tenantAssignments.map((t) => ({
        id: t.id,
        unitId: t.unit.id,
        unitNumber: t.unit.unitNumber,
        unitType: t.unit.unitType,
        monthlyRent: t.monthlyRent,
        rentDue: t.rentDue || 0,
        property: t.unit.property,
      }));

      return NextResponse.json(myUnitsWithRent);
    }

    // Get available units
    const availableUnits = await prisma.unit.findMany({
      where: {
        status: "AVAILABLE",
      },
      include: {
        property: true,
      },
    });

    // Format my units with tenant info
    const myUnits = tenantAssignments.map((t) => ({
      id: t.unit.id,
      unitNumber: t.unit.unitNumber,
      unitType: t.unit.unitType,
      rent: t.unit.rent,
      deposit: t.unit.deposit,
      status: t.unit.status,
      property: t.unit.property,
      tenantInfo: {
        leaseStartDate: t.leaseStartDate ? t.leaseStartDate.toISOString() : null,
        leaseEndDate: t.leaseEndDate ? t.leaseEndDate.toISOString() : null,
        monthlyRent: t.monthlyRent,
        depositPaid: t.depositPaid,
      },
    }));

    // Format available units
    const formattedAvailableUnits = availableUnits.map((unit) => ({
      id: unit.id,
      unitNumber: unit.unitNumber,
      unitType: unit.unitType,
      rent: unit.rent,
      deposit: unit.deposit,
      status: unit.status,
      property: unit.property,
    }));

    return NextResponse.json({
      myUnits,
      availableUnits: formattedAvailableUnits,
    });
  } catch (error) {
    console.error("Error fetching tenant units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

