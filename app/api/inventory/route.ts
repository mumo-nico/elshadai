import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/inventory - Get all inventory items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let whereClause: any = {};

    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const inventory = await prisma.inventory.findMany({
      where: whereClause,
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Create new inventory item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemName, category, date, quantityIn, unit, unitCost, supplier } = body;

    // Calculate total cost
    const totalCost = parseFloat(quantityIn) * parseFloat(unitCost);

    const inventory = await prisma.inventory.create({
      data: {
        itemName,
        category,
        date: new Date(date),
        quantityIn: parseFloat(quantityIn),
        unit,
        unitCost: parseFloat(unitCost),
        totalCost,
        supplier: supplier || null,
      },
    });

    return NextResponse.json(inventory, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory:", error);
    return NextResponse.json(
      { error: "Failed to create inventory" },
      { status: 500 }
    );
  }
}

// PUT /api/inventory - Update inventory item
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, itemName, category, date, quantityIn, unit, unitCost, supplier } = body;

    // Calculate total cost
    const totalCost = parseFloat(quantityIn) * parseFloat(unitCost);

    const inventory = await prisma.inventory.update({
      where: { id },
      data: {
        itemName,
        category,
        date: new Date(date),
        quantityIn: parseFloat(quantityIn),
        unit,
        unitCost: parseFloat(unitCost),
        totalCost,
        supplier: supplier || null,
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory - Delete inventory item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Inventory ID is required" },
        { status: 400 }
      );
    }

    await prisma.inventory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Inventory deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory" },
      { status: 500 }
    );
  }
}

