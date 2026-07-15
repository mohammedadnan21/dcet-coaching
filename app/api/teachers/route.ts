import { NextResponse } from "next/server";
import { validateSession } from "@/lib/validate-session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER", status: "APPROVED" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ items: teachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}
