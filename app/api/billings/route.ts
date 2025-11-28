import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/billings - Get monthly billing data for all tenants
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const tenantId = searchParams.get("tenantId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const statusFilter = searchParams.get("status");

    // Get current month and year if not specified
    const now = new Date();
    const currentMonth = month && month !== "all" ? month : (now.getMonth() + 1).toString();
    const currentYear = year && year !== "all" ? year : now.getFullYear().toString();

    // Build where clause for tenants
    const where: any = {
      status: "ACTIVE",
    };

    if (propertyId && propertyId !== "all") {
      where.unit = {
        propertyId: propertyId,
      };
    }

    if (tenantId && tenantId !== "all") {
      where.userId = tenantId;
    }

    // Get all active tenants with their units
    const tenants = await prisma.tenant.findMany({
      where,
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

    // For each tenant, calculate payments for the specified month/year
    const billingData = await Promise.all(
      tenants.map(async (tenant) => {
        let amountPaid = 0;
        let status = "NOT_PAID";

        // If specific month is requested (not "all")
        if (month !== "all") {
          // Get all approved payments for this tenant and unit (all time)
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

          // Calculate payment distribution using FIFO
          const monthlyRent = tenant.monthlyRent;
          const startDate = tenant.leaseStartDate || new Date();

          let remainingAmount = totalPaid;
          let currentMonthDate = new Date(startDate);
          currentMonthDate.setDate(1);
          currentMonthDate.setHours(0, 0, 0, 0);

          const targetMonth = new Date(parseInt(currentYear), parseInt(currentMonth) - 1, 1);
          targetMonth.setHours(0, 0, 0, 0);

          // Check if target month is before lease start
          if (targetMonth < currentMonthDate) {
            // Month is before the lease started - no payment due/made
            amountPaid = 0;
            status = "NOT_PAID";
          } else {
            // Distribute payments month by month until we reach the target month
            while (currentMonthDate <= targetMonth) {
              const isTargetMonth = currentMonthDate.getTime() === targetMonth.getTime();

              if (remainingAmount >= monthlyRent) {
                if (isTargetMonth) {
                  amountPaid = monthlyRent;
                  status = "FULLY_PAID";
                }
                remainingAmount -= monthlyRent;
              } else if (remainingAmount > 0) {
                if (isTargetMonth) {
                  amountPaid = remainingAmount;
                  status = "PARTIALLY_PAID";
                }
                remainingAmount = 0;
              } else {
                if (isTargetMonth) {
                  amountPaid = 0;
                  status = "NOT_PAID";
                }
              }

              currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
            }
          }
        } else if (year !== "all") {
          // All months but specific year - calculate total for that year using FIFO
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
          const selectedYear = parseInt(currentYear);

          let remainingAmount = totalPaid;
          let currentMonthDate = new Date(startDate);
          currentMonthDate.setDate(1);
          currentMonthDate.setHours(0, 0, 0, 0);

          let yearTotalRent = 0;
          let yearAmountPaid = 0;

          // Calculate through the selected year
          const yearEnd = new Date(selectedYear, 11, 31);

          while (currentMonthDate <= yearEnd) {
            const isSelectedYear = currentMonthDate.getFullYear() === selectedYear;

            if (remainingAmount >= monthlyRent) {
              if (isSelectedYear) {
                yearAmountPaid += monthlyRent;
                yearTotalRent += monthlyRent;
              }
              remainingAmount -= monthlyRent;
            } else if (remainingAmount > 0) {
              if (isSelectedYear) {
                yearAmountPaid += remainingAmount;
                yearTotalRent += monthlyRent;
              }
              remainingAmount = 0;
            } else {
              if (isSelectedYear) {
                yearTotalRent += monthlyRent;
              }
            }

            currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
          }

          amountPaid = yearAmountPaid;

          if (yearTotalRent === 0) {
            status = "NOT_PAID";
          } else if (yearAmountPaid >= yearTotalRent) {
            status = "FULLY_PAID";
          } else if (yearAmountPaid > 0) {
            status = "PARTIALLY_PAID";
          } else {
            status = "NOT_PAID";
          }
        } else {
          // For "all" months and "all" years, show total paid and current rent due
          const allPayments = await prisma.payment.findMany({
            where: {
              userId: tenant.userId,
              unitId: tenant.unitId,
              isApproved: true,
            },
          });

          amountPaid = allPayments.reduce((sum, payment) => sum + payment.amount, 0);

          // Status based on current rent due
          if (tenant.rentDue === 0) {
            status = "FULLY_PAID";
          } else if (tenant.rentDue < tenant.monthlyRent) {
            status = "PARTIALLY_PAID";
          } else {
            status = "NOT_PAID";
          }
        }

        return {
          tenantId: tenant.tenantId,
          tenantName: tenant.user.name,
          tenantEmail: tenant.user.email,
          propertyName: tenant.unit.property.name,
          unitNumber: tenant.unit.unitNumber,
          monthlyRent: tenant.monthlyRent,
          amountPaid,
          status,
          rentDue: tenant.rentDue,
        };
      })
    );

    // Filter by status if specified
    let filteredData = billingData;
    if (statusFilter && statusFilter !== "all") {
      filteredData = billingData.filter((billing) => billing.status === statusFilter);
    }

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error("Error fetching billing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing data" },
      { status: 500 }
    );
  }
}

