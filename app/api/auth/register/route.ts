import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// POST /api/auth/register - Register a new landlord
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, confirmPassword } = body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

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

    // Create landlord user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "LANDLORD",
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully", user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("=== FULL ERROR OBJECT ===");
    console.error("Error message:", error?.message);
    console.error("Error code:", error?.code);
    console.error("Error meta:", error?.meta);
    console.error("Full error:", JSON.stringify(error, null, 2));

    // Handle specific Prisma errors
    if (error?.code === "P2002") {
      const field = error?.meta?.target?.[0] || "email";
      return NextResponse.json(
        { error: `A user with this ${field} already exists` },
        { status: 400 }
      );
    }

    if (error?.code === "P2014") {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }

    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid reference data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create account", details: error?.message },
      { status: 500 }
    );
  }
}