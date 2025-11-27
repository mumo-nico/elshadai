import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// POST /api/payments/[id]/approve - Approve a payment and disburse to months
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
        { error: "Payment already approved" },
        { status: 400 }
      );
    }

    // Get tenant assignment to update rent due
    const tenantAssignment = await prisma.tenant.findFirst({
      where: {
        userId: payment.userId,
        unitId: payment.unitId,
        status: "ACTIVE",
      },
    });

    if (!tenantAssignment) {
      return NextResponse.json(
        { error: "Tenant assignment not found" },
        { status: 404 }
      );
    }

    // Calculate disbursement
    let remainingAmount = payment.amount;
    const currentRentDue = tenantAssignment.rentDue || 0;
    const monthlyRent = tenantAssignment.monthlyRent;

    // Disburse payment: First pay off existing rent due (deficit from previous months)
    let newRentDue = currentRentDue;

    if (currentRentDue > 0) {
      // There's a deficit - pay it off first
      if (remainingAmount >= currentRentDue) {
        // Payment covers the deficit
        remainingAmount -= currentRentDue;
        newRentDue = 0;
      } else {
        // Partial payment towards deficit
        newRentDue -= remainingAmount;
        remainingAmount = 0;
      }
    }

    // If there's still money left, apply to current month
    if (remainingAmount > 0) {
      if (remainingAmount >= monthlyRent) {
        // Paid current month in full, credit excess forward
        remainingAmount -= monthlyRent;
        // Excess is credited (negative rent due)
        newRentDue = -remainingAmount;
      } else {
        // Partial payment for current month
        newRentDue += (monthlyRent - remainingAmount);
        remainingAmount = 0;
      }
    } else if (newRentDue === 0) {
      // No deficit, no excess - add current month's rent to due
      newRentDue = monthlyRent;
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        isApproved: true,
        status: "APPROVED",
        approvedBy: session.user.id,
        approvedAt: new Date(),
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

    // Update tenant's rent due
    await prisma.tenant.update({
      where: { id: tenantAssignment.id },
      data: {
        rentDue: newRentDue,
      },
    });

    // Create notification for tenant
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        type: "PAYMENT_APPROVED",
        title: "Payment Approved",
        message: `Your payment of KSh ${payment.amount.toLocaleString()} for ${payment.unit.property.name} - Unit ${payment.unit.unitNumber} has been approved.`,
        link: `/dashboard/payments`,
      },
    });

    return NextResponse.json({
      payment: updatedPayment,
      newRentDue,
      message: "Payment approved successfully",
    });
  } catch (error) {
    console.error("Error approving payment:", error);
    return NextResponse.json(
      { error: "Failed to approve payment" },
      { status: 500 }
    );
  }
}

