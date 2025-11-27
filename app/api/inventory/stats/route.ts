import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/inventory/stats - Get inventory statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all inventory items
    const allInventory = await prisma.inventory.findMany();

    // Total number of items
    const totalItems = allInventory.length;

    // Total value of all items
    const totalValue = allInventory.reduce((sum, item) => sum + item.totalCost, 0);

    // Get current year
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    // Total value for current year
    const yearlyInventory = await prisma.inventory.findMany({
      where: {
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
    });
    const yearlyValue = yearlyInventory.reduce((sum, item) => sum + item.totalCost, 0);

    // Get current month
    const currentMonth = new Date().getMonth();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Total value for current month
    const monthlyInventory = await prisma.inventory.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
    const monthlyValue = monthlyInventory.reduce((sum, item) => sum + item.totalCost, 0);

    return NextResponse.json({
      totalItems,
      totalValue,
      yearlyValue,
      monthlyValue,
    });
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory stats" },
      { status: 500 }
    );
  }
}

