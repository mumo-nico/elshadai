import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateTenantId } from "@/lib/id-generator";

// POST /api/tenants/assign-unit - Assign a unit to a tenant
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, unitId, leaseStartDate, leaseEndDate, monthlyRent, depositPaid } = body;

    // Check if unit is already assigned to this tenant
    const existingAssignment = await prisma.tenant.findFirst({
      where: {
        userId,
        unitId,
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "This unit is already assigned to this tenant" },
        { status: 400 }
      );
    }

    // Generate custom tenant ID
    const tenantId = await generateTenantId();

    // Create tenant assignment
    const tenantAssignment = await prisma.tenant.create({
      data: {
        tenantId,
        userId,
        unitId,
        leaseStartDate: new Date(leaseStartDate),
        leaseEndDate: leaseEndDate ? new Date(leaseEndDate) : null,
        monthlyRent: parseFloat(monthlyRent),
        depositPaid: depositPaid ? parseFloat(depositPaid) : null,
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

    // Update unit status to OCCUPIED
    await prisma.unit.update({
      where: { id: unitId },
      data: { status: "OCCUPIED" },
    });

    // Create notification for tenant
    await prisma.notification.create({
      data: {
        userId: userId,
        type: "UNIT_ASSIGNED",
        title: "Unit Assigned",
        message: `You have been assigned to ${tenantAssignment.unit.unitNumber} at ${tenantAssignment.unit.property.name}. Your monthly rent is KSh ${monthlyRent.toLocaleString()}.`,
        isRead: false,
      },
    });

    return NextResponse.json(tenantAssignment, { status: 201 });
  } catch (error) {
    console.error("Error assigning unit:", error);
    return NextResponse.json(
      { error: "Failed to assign unit" },
      { status: 500 }
    );
  }
}

// DELETE /api/tenants/assign-unit - Unassign a unit from a tenant
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID is required" },
        { status: 400 }
      );
    }

    // Get the tenant assignment to find the unit
    const tenantAssignment = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenantAssignment) {
      return NextResponse.json(
        { error: "Tenant assignment not found" },
        { status: 404 }
      );
    }

    // Delete the tenant assignment
    await prisma.tenant.delete({
      where: { id: tenantId },
    });

    // Update unit status to AVAILABLE
    await prisma.unit.update({
      where: { id: tenantAssignment.unitId },
      data: { status: "AVAILABLE" },
    });

    return NextResponse.json({ message: "Unit unassigned successfully" });
  } catch (error) {
    console.error("Error unassigning unit:", error);
    return NextResponse.json(
      { error: "Failed to unassign unit" },
      { status: 500 }
    );
  }
}

