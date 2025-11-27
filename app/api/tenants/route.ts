import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hash } from "bcryptjs";

// GET /api/tenants - Get all tenants (with their units)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users with role TENANT and their tenant assignments
    const tenants = await prisma.user.findMany({
      where: {
        role: "TENANT",
      },
      include: {
        tenants: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}

// POST /api/tenants - Create a new tenant user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, password } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create tenant user
    const tenant = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "TENANT",
      },
    });

    // Return tenant without password
    const { password: _, ...tenantWithoutPassword } = tenant;

    return NextResponse.json(tenantWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { error: "Failed to create tenant" },
      { status: 500 }
    );
  }
}

