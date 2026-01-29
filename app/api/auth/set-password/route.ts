import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setPasswordSchema } from "@/lib/validations";

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

    // Check if OTP was verified
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email,
        verified: true,
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Please verify your email first" },
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
