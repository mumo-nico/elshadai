import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/units - Get all units
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const unitType = searchParams.get("unitType");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (unitType) {
      where.unitType = unitType;
    }

    const units = await prisma.unit.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        tenants: {
          include: {
            user: {
              select: {
                id: true,
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

    return NextResponse.json(units);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

// POST /api/units - Create a new unit (landlord only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { unitNumber, unitType, rent, deposit, propertyId, status } = body;

    // Validate required fields
    if (!unitNumber || !unitType || !rent || !propertyId) {
      return NextResponse.json(
        { error: "Unit number, type, rent, and property are required" },
        { status: 400 }
      );
    }

    // Check if unit number already exists
    const existingUnit = await prisma.unit.findUnique({
      where: { unitNumber },
    });

    if (existingUnit) {
      return NextResponse.json(
        { error: "Unit with this number already exists" },
        { status: 400 }
      );
    }

    // Create unit
    const unit = await prisma.unit.create({
      data: {
        unitNumber,
        unitType,
        rent: parseFloat(rent),
        deposit: deposit ? parseFloat(deposit) : null,
        propertyId,
        status: status || "AVAILABLE",
      },
      include: {
        property: true,
      },
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    console.error("Error creating unit:", error);
    return NextResponse.json(
      { error: "Failed to create unit" },
      { status: 500 }
    );
  }
}

