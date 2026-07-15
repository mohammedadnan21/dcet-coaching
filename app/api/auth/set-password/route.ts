import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setPasswordSchema } from "@/lib/validations";
import { rateLimitDb } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = setPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Rate limit: 5 attempts per email per 10 minutes
    const rateLimitResult = await rateLimitDb(`set-password:${email.toLowerCase()}`, 5, 600_000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Check if OTP was verified AND not expired (must be within 10 minutes of verification)
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email,
        verified: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Verification expired. Please verify your email again." },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        isVerified: true,
      },
    });

    // Delete OTP records
    await prisma.otpVerification.deleteMany({
      where: { email },
    });

    return NextResponse.json({
      message: "Password set successfully. Please wait for admin approval.",
      status: user.status,
    });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
