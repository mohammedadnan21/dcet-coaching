import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.sessionToken) {
      return NextResponse.json({ valid: false, reason: "no_session" });
    }

    // Check if session is still active
    const deviceSession = await prisma.deviceSession.findUnique({
      where: { token: session.user.sessionToken },
    });

    if (!deviceSession) {
      return NextResponse.json({ valid: false, reason: "session_not_found" });
    }

    if (!deviceSession.active) {
      return NextResponse.json({ 
        valid: false, 
        reason: "logged_out",
        message: "You have been logged out because you logged in from another device."
      });
    }

    if (new Date() > deviceSession.expiresAt) {
      return NextResponse.json({ valid: false, reason: "session_expired" });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Check session error:", error);
    return NextResponse.json({ valid: false, reason: "error" });
  }
}
