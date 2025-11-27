import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/tenant/unit-payments - Get payment history for a specific unit
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TENANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get("unitId");

    if (!unitId) {
      return NextResponse.json(
        { error: "Unit ID is required" },
        { status: 400 }
      );
    }

    // Get tenant assignment for this unit
    const tenant = await prisma.tenant.findFirst({
      where: {
        userId: session.user.id,
        unitId: unitId,
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

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant assignment not found" },
        { status: 404 }
      );
    }

    // Get all approved payments for this unit
    const payments = await prisma.payment.findMany({
      where: {
        userId: session.user.id,
        unitId: unitId,
        isApproved: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Calculate payment distribution across months
    const monthlyRent = tenant.monthlyRent;
    let totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    let overpayment = 0;

    // Start from lease start date or first payment date
    const startDate = tenant.leaseStartDate || (payments.length > 0 ? payments[0].createdAt : new Date());
    const currentDate = new Date();

    // Generate month-by-month breakdown
    const monthlyBreakdown: any[] = [];
    let remainingAmount = totalPaid;
    let currentMonth = new Date(startDate);

    while (currentMonth <= currentDate && remainingAmount > 0) {
      const monthName = currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      let amountForMonth = 0;
      let status = "NOT_PAID";

      if (remainingAmount >= monthlyRent) {
        amountForMonth = monthlyRent;
        status = "FULLY_PAID";
        remainingAmount -= monthlyRent;
      } else if (remainingAmount > 0) {
        amountForMonth = remainingAmount;
        status = "PARTIALLY_PAID";
        remainingAmount = 0;
      }

      if (amountForMonth > 0) {
        monthlyBreakdown.push({
          month: monthName,
          monthlyRent,
          amountPaid: amountForMonth,
          status,
        });
      }

      // Move to next month
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    // Check if there's overpayment
    if (remainingAmount > 0) {
      overpayment = remainingAmount;
    }

    // Add current month if not paid
    const now = new Date();
    const currentMonthName = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const currentMonthPaid = monthlyBreakdown.find(
      (m) => m.month === currentMonthName
    );

    if (!currentMonthPaid && tenant.rentDue > 0) {
      monthlyBreakdown.push({
        month: currentMonthName,
        monthlyRent,
        amountPaid: 0,
        status: "NOT_PAID",
      });
    }

    return NextResponse.json({
      unit: {
        id: tenant.unit.id,
        unitNumber: tenant.unit.unitNumber,
        property: tenant.unit.property.name,
        monthlyRent: tenant.monthlyRent,
      },
      totalPaid,
      overpayment,
      rentDue: tenant.rentDue,
      monthlyBreakdown,
    });
  } catch (error) {
    console.error("Error fetching unit payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit payments" },
      { status: 500 }
    );
  }
}

