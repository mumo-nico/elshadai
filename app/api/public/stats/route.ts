import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/stats - Get public statistics for landing page
export async function GET() {
  try {
    // Get total units
    const totalUnits = await prisma.unit.count();

    // Get occupied units
    const occupiedUnits = await prisma.unit.count({
      where: {
        status: "OCCUPIED",
      },
    });

    // Get available units
    const availableUnits = await prisma.unit.count({
      where: {
        status: "AVAILABLE",
      },
    });

    // Get total active tenants
    const totalTenants = await prisma.tenant.count({
      where: {
        status: "ACTIVE",
      },
    });

    // Get units by type
    const unitsByType = await prisma.unit.groupBy({
      by: ["unitType"],
      _count: {
        id: true,
      },
      where: {
        status: {
          in: ["AVAILABLE", "OCCUPIED"],
        },
      },
    });

    // Get occupied and available counts by type
    const unitTypeStats = await Promise.all(
      unitsByType.map(async (typeGroup) => {
        const occupied = await prisma.unit.count({
          where: {
            unitType: typeGroup.unitType,
            status: "OCCUPIED",
          },
        });

        const available = await prisma.unit.count({
          where: {
            unitType: typeGroup.unitType,
            status: "AVAILABLE",
          },
        });

        return {
          type: typeGroup.unitType,
          total: typeGroup._count.id,
          occupied,
          available,
        };
      })
    );

    return NextResponse.json({
      totalUnits,
      occupiedUnits,
      availableUnits,
      totalTenants,
      unitTypeStats,
    });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

