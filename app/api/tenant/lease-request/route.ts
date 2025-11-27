import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// POST /api/tenant/lease-request - Tenant requests to lease a unit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TENANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { unitId, message } = body;

    // Verify unit is available
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: { property: true },
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    if (unit.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Unit is not available" },
        { status: 400 }
      );
    }

    // Create a complaint as a lease request (we can use the complaint system for now)
    // In a real system, you might want a separate LeaseRequest model
    const leaseRequest = await prisma.complaint.create({
      data: {
        userId: session.user.id,
        unitId: unitId,
        title: `Lease Request for Unit ${unit.unitNumber}`,
        description: message || `I would like to lease Unit ${unit.unitNumber} at ${unit.property.name}.`,
        status: "PENDING",
        priority: "MEDIUM",
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(leaseRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating lease request:", error);
    return NextResponse.json(
      { error: "Failed to create lease request" },
      { status: 500 }
    );
  }
}

