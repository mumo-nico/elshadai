import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/reports/payments - Get payments report
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const status = searchParams.get("status");
    const year = searchParams.get("year");

    const where: any = {};

    // If tenant, only show their payments
    if (session.user.role === "TENANT") {
      where.userId = session.user.id;
    }

    // Filter by date range
    if (dateFrom && dateTo) {
      where.createdAt = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    }

    // Filter by year (for tenant reports)
    if (year) {
      where.year = parseInt(year);
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                name: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      paymentId: payment.paymentId,
      receiptNumber: payment.receiptNumber || payment.id,
      tenant: payment.user.name,
      email: payment.user.email,
      phone: payment.user.phone,
      property: payment.unit.property.name,
      unitNumber: payment.unit.unitNumber,
      unitType: payment.unit.unitType,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber,
      month: payment.month,
      year: payment.year,
      status: payment.status,
      isApproved: payment.isApproved,
      approvedAt: payment.approvedAt,
      createdAt: payment.createdAt,
      notes: payment.notes,
    }));

    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error("Error fetching payments report:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments report" },
      { status: 500 }
    );
  }
}

