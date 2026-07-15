import { NextResponse } from "next/server";
import { validateSessionWithRole } from "@/lib/validate-session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await validateSessionWithRole("STUDENT", "ADMIN");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = session.user.id;

    const [user, feeRecords, payments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.feeRecord.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        where: { studentId },
        select: {
          id: true,
          receiptNo: true,
          amount: true,
          paymentMode: true,
          purpose: true,
          installmentNo: true,
          paidAt: true,
          feeRecordId: true,
        },
        orderBy: { paidAt: "desc" },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalFee = feeRecords.reduce((sum, r) => sum + r.totalFee, 0);
    const totalRemaining = feeRecords.reduce((sum, r) => sum + r.remainingAmount, 0);

    return NextResponse.json({
      user,
      feeRecords,
      payments,
      feeSummary: {
        totalFee: totalFee || totalPaid,
        totalPaid,
        totalRemaining,
        isFullyPaid: totalRemaining <= 0,
        hasPayments: payments.length > 0,
      },
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
