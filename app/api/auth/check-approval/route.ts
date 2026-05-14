import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ status: "PENDING" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { status: true },
    });

    return NextResponse.json({ status: user?.status || "PENDING" });
  } catch (error) {
    console.error("Check approval error:", error);
    return NextResponse.json({ status: "PENDING" });
  }
}
