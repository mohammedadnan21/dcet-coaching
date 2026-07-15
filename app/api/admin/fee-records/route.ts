import { NextRequest, NextResponse } from "next/server";
import { validateSessionWithRole } from "@/lib/validate-session";
import { prisma } from "@/lib/db";
import { syncPaymentToSheet } from "@/lib/google-sheets";

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

export async function DELETE(request: NextRequest) {
  try {
    const session = await validateSessionWithRole("ADMIN");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Fee record ID is required" }, { status: 400 });
    }

    const feeRecord = await prisma.feeRecord.findUnique({
      where: { id },
      include: {
        payments: { select: { id: true, receiptNo: true, studentName: true, studentPhone: true, amount: true } },
        student: { select: { name: true } },
      },
    });

    if (!feeRecord) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Delete all linked payments
      await tx.payment.deleteMany({ where: { feeRecordId: id } });
      // Delete the fee record
      await tx.feeRecord.delete({ where: { id } });
    });

    // Log to Google Sheets
    if (feeRecord.payments.length > 0) {
      const firstPayment = feeRecord.payments[0];
      syncPaymentToSheet({
        receiptNo: `FEE-RECORD (DELETED)`,
        studentName: firstPayment.studentName || feeRecord.student?.name || "Unknown",
        studentPhone: firstPayment.studentPhone || "",
        amount: -feeRecord.paidAmount,
        paymentMode: "DELETED",
        purpose: "DELETED",
        description: `Fee record + ${feeRecord.payments.length} payment(s) deleted by admin`,
        installmentNo: null,
        totalFee: feeRecord.totalFee,
        paidSoFar: null,
        remainingBalance: null,
        recordedBy: session.user.name || "Admin",
        paidAt: new Date().toISOString(),
      }).catch(() => {});
    }

    return NextResponse.json({ message: "Fee record and all linked payments deleted" });
  } catch (error) {
    console.error("Error deleting fee record:", error);
    return NextResponse.json({ error: "Failed to delete fee record" }, { status: 500 });
  }
}
