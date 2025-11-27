import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// PATCH /api/tenants/[id]/rent-due - Update rent due for a tenant assignment
export async function PATCH(
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
    const { rentDue } = body;

    if (typeof rentDue !== "number" || rentDue < 0) {
      return NextResponse.json(
        { error: "Invalid rent due amount" },
        { status: 400 }
      );
    }

    // Update the tenant assignment's rent due
    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: { rentDue },
    });

    return NextResponse.json(updatedTenant);
  } catch (error) {
    console.error("Error updating rent due:", error);
    return NextResponse.json(
      { error: "Failed to update rent due" },
      { status: 500 }
    );
  }
}

