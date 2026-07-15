import { NextRequest, NextResponse } from "next/server";
import { validateSessionWithRole } from "@/lib/validate-session";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await validateSessionWithRole("ADMIN");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.student = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
        ],
      };
    }

    const [feeRecords, total] = await Promise.all([
      prisma.feeRecord.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: { select: { id: true, name: true, phone: true, email: true } },
          payments: {
            select: {
              id: true,
              receiptNo: true,
              amount: true,
              paymentMode: true,
              installmentNo: true,
              paidAt: true,
            },
            orderBy: { paidAt: "asc" },
            take: 20,
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.feeRecord.count({ where }),
    ]);

    return NextResponse.json({ items: feeRecords, total, page, limit });
  } catch (error) {
    console.error("Error fetching fee records:", error);
    return NextResponse.json({ error: "Failed to fetch fee records" }, { status: 500 });
  }
}
