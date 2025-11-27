import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/dashboard/tenant - Get tenant dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TENANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get tenant's active unit assignments
    const tenantAssignments = await prisma.tenant.findMany({
      where: {
        userId,
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

    const unitsLeased = tenantAssignments.length;

    // Calculate total rent due
    const totalRentDue = tenantAssignments.reduce(
      (sum, assignment) => sum + (assignment.rentDue || 0),
      0
    );

    // Get total payments made (approved)
    const paymentsSum = await prisma.payment.aggregate({
      where: {
        userId,
        isApproved: true,
      },
      _sum: {
        amount: true,
      },
    });

    const totalPaymentsMade = paymentsSum._sum.amount || 0;

    // Get this month's payments
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyPaymentsSum = await prisma.payment.aggregate({
      where: {
        userId,
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

    const thisMonthPayments = monthlyPaymentsSum._sum.amount || 0;

    // Get this year's payments
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(now.getFullYear(), 11, 31);

    const yearlyPaymentsSum = await prisma.payment.aggregate({
      where: {
        userId,
        isApproved: true,
        paymentDate: {
          gte: firstDayOfYear,
          lte: lastDayOfYear,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const thisYearPayments = yearlyPaymentsSum._sum.amount || 0;

    // Calculate average monthly payment (this year)
    const monthsPassed = now.getMonth() + 1;
    const averageMonthlyPayment = monthsPassed > 0 ? thisYearPayments / monthsPassed : 0;

    // Get pending payments count
    const pendingPayments = await prisma.payment.count({
      where: {
        userId,
        isApproved: false,
      },
    });

    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      where: {
        userId,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

    // Get upcoming payment (next month's rent)
    const nextMonthRent = tenantAssignments.reduce(
      (sum, assignment) => sum + assignment.monthlyRent,
      0
    );

    return NextResponse.json({
      unitsLeased,
      totalRentDue,
      totalPaymentsMade,
      thisMonthPayments,
      thisYearPayments,
      averageMonthlyPayment: Math.round(averageMonthlyPayment),
      pendingPayments,
      nextMonthRent,
      tenantAssignments,
      recentPayments,
    });
  } catch (error) {
    console.error("Error fetching tenant dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

