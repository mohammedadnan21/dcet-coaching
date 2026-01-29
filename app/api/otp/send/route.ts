import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOTPEmail, generateOTP } from "@/lib/email";
import { registerSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, name, phone, role } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this email
    await prisma.otpVerification.deleteMany({
      where: { email },
    });

    // Store OTP
    await prisma.otpVerification.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // If user doesn't exist, create a pending user
    if (!existingUser) {
      await prisma.user.create({
        data: {
          name,
          email,
          phone,
          password: "", // Will be set after OTP verification
          role,
          status: "PENDING",
          isVerified: false,
        },
      });
    }

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      // For development, return OTP in response if email fails
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          message: "OTP generated (email not configured)",
          otp: otp, // Only in development!
        });
      }
      return NextResponse.json(
        { error: "Failed to send OTP email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
