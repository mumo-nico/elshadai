import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/dashboard/landlord - Get landlord dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total properties
    const totalProperties = await prisma.property.count();

    // Get total units
    const totalUnits = await prisma.unit.count();

    // Get units by status
    const unitsByStatus = await prisma.unit.groupBy({
      by: ["status"],
      _count: true,
    });

    const occupiedUnits = unitsByStatus.find((u) => u.status === "OCCUPIED")?._count || 0;
    const availableUnits = unitsByStatus.find((u) => u.status === "AVAILABLE")?._count || 0;
    const maintenanceUnits = unitsByStatus.find((u) => u.status === "MAINTENANCE")?._count || 0;

    // Calculate occupancy rate
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    // Get total tenants (unique users with TENANT role who have active assignments)
    const totalTenants = await prisma.user.count({
      where: {
        role: "TENANT",
        tenants: {
          some: {
            status: "ACTIVE",
          },
        },
      },
    });

    // Get total revenue (sum of all approved payments)
    const paymentsSum = await prisma.payment.aggregate({
      where: {
        isApproved: true,
      },
      _sum: {
        amount: true,
      },
    });

    const totalRevenue = paymentsSum._sum.amount || 0;

    // Get this month's revenue
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyPaymentsSum = await prisma.payment.aggregate({
      where: {
        isApproved: true,
        paymentDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const monthlyRevenue = monthlyPaymentsSum._sum.amount || 0;

    // Get total rent due
    const rentDueSum = await prisma.tenant.aggregate({
      where: {
        status: "ACTIVE",
      },
      _sum: {
        rentDue: true,
      },
    });

    const totalRentDue = rentDueSum._sum.rentDue || 0;

    // Get pending payments count
    const pendingPayments = await prisma.payment.count({
      where: {
        isApproved: false,
      },
    });

    // Get recent activities (recent tenant assignments, payments, complaints)
    const recentTenants = await prisma.tenant.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        unit: true,
      },
    });

    return NextResponse.json({
      totalProperties,
      totalUnits,
      occupiedUnits,
      availableUnits,
      maintenanceUnits,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      totalTenants,
      totalRevenue,
      monthlyRevenue,
      totalRentDue,
      pendingPayments,
      recentTenants,
      recentPayments,
    });
  } catch (error) {
    console.error("Error fetching landlord dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

