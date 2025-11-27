import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePaymentId } from "@/lib/id-generator";

// GET /api/payments - Get all payments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const where: any = {};

    // If tenant, only show their payments
    if (session.user.role === "TENANT") {
      where.userId = session.user.id;
    } else if (userId) {
      // If landlord and userId is provided, filter by userId
      where.userId = userId;
    }

    // Filter by approval status
    if (status === "PENDING") {
      where.isApproved = false;
      where.status = "PENDING";
    } else if (status === "APPROVED") {
      where.isApproved = true;
    } else if (status) {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
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
            property: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create a new payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TENANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      unitId,
      amount,
      paymentMethod,
      referenceNumber,
      cashReceiver,
      month,
      year,
      notes,
    } = body;

    // Validate required fields
    if (!unitId || !amount || !paymentMethod || !month || !year) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that tenant is assigned to this unit
    const tenantAssignment = await prisma.tenant.findFirst({
      where: {
        userId: session.user.id,
        unitId,
        status: "ACTIVE",
      },
    });

    if (!tenantAssignment) {
      return NextResponse.json(
        { error: "You are not assigned to this unit" },
        { status: 403 }
      );
    }

    // Generate custom payment ID
    const paymentId = await generatePaymentId();

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        paymentId,
        userId: session.user.id,
        unitId,
        amount: parseFloat(amount),
        paymentMethod,
        referenceNumber,
        cashReceiver,
        month: parseInt(month),
        year: parseInt(year),
        notes,
        status: "PENDING",
        isApproved: false,
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
            property: true,
          },
        },
      },
    });

    // Get landlord user (first LANDLORD role user)
    const landlord = await prisma.user.findFirst({
      where: {
        role: "LANDLORD",
      },
    });

    // Create notification for landlord
    if (landlord) {
      await prisma.notification.create({
        data: {
          userId: landlord.id,
          type: "PAYMENT_APPROVED",
          title: "New Payment Submitted",
          message: `${session.user.name} submitted a payment of KSh ${amount.toLocaleString()} for ${payment.unit.property.name} - Unit ${payment.unit.unitNumber}`,
          link: `/dashboard/payments`,
        },
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

