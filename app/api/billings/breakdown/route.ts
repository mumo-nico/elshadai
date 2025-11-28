import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/billings/breakdown - Get monthly breakdown for all units of a tenant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId || tenantId === "all") {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 });
    }

    // Get all active units for this tenant
    const tenants = await prisma.tenant.findMany({
      where: {
        userId: tenantId,
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (tenants.length === 0) {
      return NextResponse.json({ error: "No active units found for this tenant" }, { status: 404 });
    }

    // For each unit, calculate monthly breakdown
    const unitsBreakdown = await Promise.all(
      tenants.map(async (tenant) => {
        // Get all approved payments for this unit
        const allPayments = await prisma.payment.findMany({
          where: {
            userId: tenant.userId,
            unitId: tenant.unitId,
            isApproved: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        const totalPaid = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const monthlyRent = tenant.monthlyRent;
        const startDate = tenant.leaseStartDate || new Date();

        // Generate month-by-month breakdown from lease start to current month
        const monthlyBreakdown: any[] = [];
        let remainingAmount = totalPaid;
        let currentMonth = new Date(startDate);
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const now = new Date();
        now.setDate(1);
        now.setHours(0, 0, 0, 0);

        // Generate all months from lease start to current month
        while (currentMonth <= now) {
          const monthName = currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });

          let amountForMonth = 0;
          let status = "NOT_PAID";

          // Distribute payment using FIFO (First In First Out)
          if (remainingAmount >= monthlyRent) {
            amountForMonth = monthlyRent;
            status = "FULLY_PAID";
            remainingAmount -= monthlyRent;
          } else if (remainingAmount > 0) {
            amountForMonth = remainingAmount;
            status = "PARTIALLY_PAID";
            remainingAmount = 0;
          }

          monthlyBreakdown.push({
            month: monthName,
            monthlyRent,
            amountPaid: amountForMonth,
            status,
          });

          // Move to next month
          currentMonth.setMonth(currentMonth.getMonth() + 1);
        }

        // If there's still remaining amount after covering all months, it's overpayment
        // Distribute overpayment to future months
        let overpayment = remainingAmount;
        if (overpayment > 0) {
          let futureMonth = new Date(now);
          futureMonth.setMonth(futureMonth.getMonth() + 1);

          while (overpayment > 0) {
            const monthName = futureMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });

            let amountForMonth = 0;
            let status = "NOT_PAID";

            if (overpayment >= monthlyRent) {
              amountForMonth = monthlyRent;
              status = "FULLY_PAID";
              overpayment -= monthlyRent;
            } else if (overpayment > 0) {
              amountForMonth = overpayment;
              status = "PARTIALLY_PAID";
              overpayment = 0;
            }

            monthlyBreakdown.push({
              month: monthName,
              monthlyRent,
              amountPaid: amountForMonth,
              status,
            });

            // Move to next month
            futureMonth.setMonth(futureMonth.getMonth() + 1);
          }
        }

        return {
          unitId: tenant.unitId,
          unitNumber: tenant.unit.unitNumber,
          propertyName: tenant.unit.property.name,
          monthlyRent: tenant.monthlyRent,
          totalPaid,
          overpayment,
          rentDue: tenant.rentDue,
          monthlyBreakdown,
        };
      })
    );

    return NextResponse.json({
      tenantName: tenants[0].user.name,
      tenantEmail: tenants[0].user.email,
      units: unitsBreakdown,
    });
  } catch (error) {
    console.error("Error fetching billing breakdown:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing breakdown" },
      { status: 500 }
    );
  }
}


