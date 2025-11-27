import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// POST /api/payments/[id]/deny - Deny a payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    // Get the payment
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: true,
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.isApproved) {
      return NextResponse.json(
        { error: "Cannot deny an approved payment" },
        { status: 400 }
      );
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: "REJECTED",
        notes: reason || payment.notes,
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

    // Create notification for tenant
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        type: "PAYMENT_REJECTED",
        title: "Payment Rejected",
        message: `Your payment of KSh ${payment.amount.toLocaleString()} for ${payment.unit.property.name} - Unit ${payment.unit.unitNumber} has been rejected. ${reason ? `Reason: ${reason}` : ""}`,
        link: `/dashboard/payments`,
      },
    });

    return NextResponse.json({
      payment: updatedPayment,
      message: "Payment rejected successfully",
    });
  } catch (error) {
    console.error("Error denying payment:", error);
    return NextResponse.json(
      { error: "Failed to deny payment" },
      { status: 500 }
    );
  }
}

