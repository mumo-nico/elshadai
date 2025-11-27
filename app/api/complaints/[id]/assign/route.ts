import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// POST /api/complaints/[id]/assign - Assign technician to complaint
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
    const { assignedToName, assignedToPhone } = body;

    if (!assignedToName || !assignedToPhone) {
      return NextResponse.json(
        { error: "Technician name and phone are required" },
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

    // Update complaint with assignment
    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        assignedTo: session.user.id,
        assignedToName,
        assignedToPhone,
        status: "IN_PROGRESS",
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

    // Create notification for tenant
    await prisma.notification.create({
      data: {
        userId: complaint.userId,
        type: "COMPLAINT_UPDATE",
        title: "Technician Assigned to Your Complaint",
        message: `A technician (${assignedToName}, ${assignedToPhone}) has been assigned to your ${complaint.category.toLowerCase()} complaint for ${complaint.unit.property.name} - Unit ${complaint.unit.unitNumber}`,
        link: `/dashboard/complaints`,
      },
    });

    return NextResponse.json(updatedComplaint);
  } catch (error) {
    console.error("Error assigning complaint:", error);
    return NextResponse.json(
      { error: "Failed to assign complaint" },
      { status: 500 }
    );
  }
}

