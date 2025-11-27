import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateComplaintId } from "@/lib/id-generator";

// GET /api/complaints - Get all complaints
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const where: any = {};

    // If tenant, only show their complaints
    if (session.user.role === "TENANT") {
      where.userId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const complaints = await prisma.complaint.findMany({
      where,
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
        comments: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

// POST /api/complaints - Create a new complaint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, priority, unitId } = body;

    // Validate required fields
    if (!title || !description || !category || !unitId) {
      return NextResponse.json(
        { error: "Title, description, category, and unit are required" },
        { status: 400 }
      );
    }

    // Generate custom complaint ID
    const complaintId = await generateComplaintId();

    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        complaintId,
        title,
        description,
        category,
        priority: priority || "MEDIUM",
        status: "PENDING",
        unitId,
        userId: session.user.id,
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

    // Create notification for landlord
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
          title: "New Complaint Submitted",
          message: `${session.user.name} submitted a ${category.toLowerCase()} complaint for ${complaint.unit.property.name} - Unit ${complaint.unit.unitNumber}`,
          link: `/dashboard/complaints`,
        },
      });
    }

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { error: "Failed to create complaint" },
      { status: 500 }
    );
  }
}

