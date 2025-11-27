import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/reports/complaints - Get complaints report
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
    const category = searchParams.get("category");

    const where: any = {};

    // If tenant, only show their complaints
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

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by category
    if (category) {
      where.category = category;
    }

    const complaints = await prisma.complaint.findMany({
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

    const formattedComplaints = complaints.map((complaint) => ({
      id: complaint.id,
      complaintId: complaint.complaintId,
      tenant: complaint.user.name,
      email: complaint.user.email,
      phone: complaint.user.phone,
      property: complaint.unit.property.name,
      unitNumber: complaint.unit.unitNumber,
      category: complaint.category,
      title: complaint.title,
      description: complaint.description,
      priority: complaint.priority,
      status: complaint.status,
      assignedToName: complaint.assignedToName,
      assignedToPhone: complaint.assignedToPhone,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      closedAt: complaint.closedAt,
    }));

    return NextResponse.json(formattedComplaints);
  } catch (error) {
    console.error("Error fetching complaints report:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints report" },
      { status: 500 }
    );
  }
}

