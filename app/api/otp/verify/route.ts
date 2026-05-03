import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyOtpSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = rateLimit(`otp-verify:${ip}`, 10, 60_000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again after a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, otp } = validation.data;

    // Find OTP record
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email,
        otp,
        verified: false,
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await prisma.otpVerification.delete({
        where: { id: otpRecord.id },
      });
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return NextResponse.json({
      message: "OTP verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
