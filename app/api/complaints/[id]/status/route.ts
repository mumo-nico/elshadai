import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// PATCH /api/complaints/[id]/status - Update complaint status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Get the complaint
    const complaint = await prisma.complaint.findUnique({
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

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    // Check permissions
    // Tenants can only mark as RESOLVED
    if (session.user.role === "TENANT") {
      if (complaint.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (status !== "RESOLVED") {
        return NextResponse.json(
          { error: "Tenants can only mark complaints as resolved" },
          { status: 403 }
        );
      }
    }

    // Landlords can change to any status
    const updateData: any = {
      status,
    };

    if (status === "RESOLVED") {
      updateData.resolvedAt = new Date();
    } else if (status === "CLOSED") {
      updateData.closedAt = new Date();
      if (!complaint.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
    }

    // Update complaint status
    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
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

    // Create notification
    if (session.user.role === "TENANT" && status === "RESOLVED") {
      // Notify landlord that tenant marked as resolved
      const landlords = await prisma.user.findMany({
        where: {
          role: "LANDLORD",
        },
      });

      for (const landlord of landlords) {
        await prisma.notification.create({
          data: {
            userId: landlord.id,
            type: "COMPLAINT_UPDATE",
            title: "Complaint Marked as Resolved",
            message: `${session.user.name} marked their ${complaint.category.toLowerCase()} complaint as resolved for ${complaint.unit.property.name} - Unit ${complaint.unit.unitNumber}`,
            link: `/dashboard/complaints`,
          },
        });
      }
    } else if (session.user.role === "LANDLORD" && status === "CLOSED") {
      // Notify tenant that complaint is closed
      await prisma.notification.create({
        data: {
          userId: complaint.userId,
          type: "COMPLAINT_UPDATE",
          title: "Complaint Closed",
          message: `Your ${complaint.category.toLowerCase()} complaint for ${complaint.unit.property.name} - Unit ${complaint.unit.unitNumber} has been closed`,
          link: `/dashboard/complaints`,
        },
      });
    }

    return NextResponse.json(updatedComplaint);
  } catch (error) {
    console.error("Error updating complaint status:", error);
    return NextResponse.json(
      { error: "Failed to update complaint status" },
      { status: 500 }
    );
  }
}

