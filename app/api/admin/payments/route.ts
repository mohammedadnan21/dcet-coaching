import { NextRequest, NextResponse } from "next/server";
import { validateSessionWithRole } from "@/lib/validate-session";
import { prisma } from "@/lib/db";
import { syncPaymentToSheet } from "@/lib/google-sheets";

async function generateReceiptNo(tx: { payment: { findFirst: Function } }): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const prefix = `WA${year}${month}-`;

  // Get the latest receipt with this prefix to generate sequential number
  const latest = await tx.payment.findFirst({
    where: { receiptNo: { startsWith: prefix } },
    orderBy: { createdAt: "desc" },
    select: { receiptNo: true },
  });

  let nextNum = 1001;
  if (latest) {
    const lastNum = parseInt(latest.receiptNo.split("-")[1]);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${prefix}${nextNum}`;
}

function isValidAmount(value: unknown): boolean {
  const num = Number(value);
  return Number.isFinite(num) && num > 0;
}

export async function GET(request: NextRequest) {
  try {
    const session = await validateSessionWithRole("ADMIN");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { studentName: { contains: search, mode: "insensitive" } },
        { studentPhone: { contains: search } },
        { receiptNo: { contains: search, mode: "insensitive" } },
      ];
    }

    const [payments, total, totalCollected] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          recordedBy: { select: { name: true } },
          feeRecord: { select: { totalFee: true, paidAmount: true, remainingAmount: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
    ]);

    return NextResponse.json({
      items: payments,
      total,
      page,
      limit,
      totalCollected: totalCollected._sum.amount || 0,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await validateSessionWithRole("ADMIN");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, amount, paymentMode, purpose, description, totalFee, feeRecordId } = body;

    if (!studentId || !amount) {
      return NextResponse.json(
        { error: "Student and amount are required" },
        { status: 400 }
      );
    }

    if (!isValidAmount(amount)) {
      return NextResponse.json(
        { error: "Amount must be a valid number greater than 0" },
        { status: 400 }
      );
    }

    if (totalFee && !isValidAmount(totalFee)) {
      return NextResponse.json(
        { error: "Total fee must be a valid number greater than 0" },
        { status: 400 }
      );
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, phone: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const paidAmount = Number(amount);

    // Use a transaction to ensure fee record + payment are created atomically
    const payment = await prisma.$transaction(async (tx) => {
      const receiptNo = await generateReceiptNo(tx);
      let linkedFeeRecordId = feeRecordId || null;
      let installmentNo: number | null = null;

      if (feeRecordId) {
        // Row-level lock to prevent concurrent payment race conditions
        const lockedRecords = await tx.$queryRaw<Array<{
          id: string; studentId: string; totalFee: number;
          paidAmount: number; remainingAmount: number;
        }>>`SELECT id, "studentId", "totalFee", "paidAmount", "remainingAmount" FROM "FeeRecord" WHERE id = ${feeRecordId} FOR UPDATE`;

        const feeRecord = lockedRecords[0];
        if (!feeRecord) {
          throw new Error("Fee record not found");
        }

        if (feeRecord.studentId !== studentId) {
          throw new Error("Fee record does not belong to this student");
        }

        if (paidAmount > feeRecord.remainingAmount) {
          throw new Error(`Amount exceeds remaining balance of ₹${feeRecord.remainingAmount.toLocaleString("en-IN")}`);
        }

        const paymentCount = await tx.payment.count({ where: { feeRecordId } });
        installmentNo = paymentCount + 1;
        const newPaid = feeRecord.paidAmount + paidAmount;
        const newRemaining = feeRecord.totalFee - newPaid;

        await tx.feeRecord.update({
          where: { id: feeRecordId },
          data: {
            paidAmount: newPaid,
            remainingAmount: newRemaining,
            status: newRemaining <= 0 ? "PAID" : "PARTIAL",
          },
        });
      } else if (totalFee && Number(totalFee) > 0) {
        const totalFeeAmount = Number(totalFee);

        if (paidAmount > totalFeeAmount) {
          throw new Error("Payment amount cannot exceed total fee");
        }

        const remaining = totalFeeAmount - paidAmount;

        const newFeeRecord = await tx.feeRecord.create({
          data: {
            studentId: student.id,
            totalFee: totalFeeAmount,
            paidAmount: paidAmount,
            remainingAmount: remaining,
            feeType: purpose || "ADMISSION",
            status: remaining <= 0 ? "PAID" : "PARTIAL",
            description: description || null,
          },
        });

        linkedFeeRecordId = newFeeRecord.id;
        installmentNo = 1;
      }

      return await tx.payment.create({
        data: {
          receiptNo,
          studentId: student.id,
          studentName: student.name,
          studentPhone: student.phone,
          amount: paidAmount,
          paymentMode: paymentMode || "CASH",
          purpose: purpose || "ADMISSION",
          description: description || null,
          feeRecordId: linkedFeeRecordId,
          installmentNo,
          recordedById: session.user.id,
        },
        include: {
          feeRecord: true,
        },
      });
    });

    // Sync to Google Sheets (non-blocking, outside transaction)
    syncPaymentToSheet({
      receiptNo: payment.receiptNo,
      studentName: payment.studentName,
      studentPhone: payment.studentPhone,
      amount: payment.amount,
      paymentMode: payment.paymentMode,
      purpose: payment.purpose,
      description: payment.description,
      installmentNo: payment.installmentNo,
      totalFee: payment.feeRecord?.totalFee || null,
      paidSoFar: payment.feeRecord?.paidAmount || null,
      remainingBalance: payment.feeRecord?.remainingAmount || null,
      recordedBy: session.user.name || "Admin",
      paidAt: payment.paidAt.toISOString(),
    }).catch(() => {});

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to record payment";
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await validateSessionWithRole("ADMIN");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, amount, paymentMode, purpose, description } = body;

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    if (amount !== undefined && !isValidAmount(amount)) {
      return NextResponse.json({ error: "Amount must be a valid number greater than 0" }, { status: 400 });
    }

    const updatedPayment = await prisma.$transaction(async (tx) => {
      const existingPayment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { feeRecord: true },
      });

      if (!existingPayment) {
        throw new Error("Payment not found");
      }

      const newAmount = amount ? Number(amount) : existingPayment.amount;

      // If amount changed and payment is linked to a fee record, update with row lock
      if (existingPayment.feeRecordId && newAmount !== existingPayment.amount) {
        const lockedRecords = await tx.$queryRaw<Array<{
          id: string; totalFee: number; paidAmount: number; remainingAmount: number;
        }>>`SELECT id, "totalFee", "paidAmount", "remainingAmount" FROM "FeeRecord" WHERE id = ${existingPayment.feeRecordId} FOR UPDATE`;

        const feeRecord = lockedRecords[0];
        if (!feeRecord) throw new Error("Fee record not found");

        const amountDifference = newAmount - existingPayment.amount;
        const newPaidAmount = feeRecord.paidAmount + amountDifference;
        const newRemaining = feeRecord.totalFee - newPaidAmount;

        if (newPaidAmount < 0) {
          throw new Error("Edit would result in negative paid amount. Please check the value.");
        }

        if (newRemaining < 0) {
          throw new Error(`New amount exceeds total fee. Max allowed: ₹${(existingPayment.amount + feeRecord.remainingAmount).toLocaleString("en-IN")}`);
        }

        await tx.feeRecord.update({
          where: { id: existingPayment.feeRecordId },
          data: {
            paidAmount: newPaidAmount,
            remainingAmount: newRemaining,
            status: newRemaining <= 0 ? "PAID" : "PARTIAL",
          },
        });
      }

      return await tx.payment.update({
        where: { id: paymentId },
        data: {
          amount: newAmount,
          paymentMode: paymentMode || existingPayment.paymentMode,
          purpose: purpose || existingPayment.purpose,
          description: description !== undefined ? description : existingPayment.description,
        },
        include: {
          feeRecord: true,
          recordedBy: { select: { name: true } },
        },
      });
    });

    // Sync correction to Google Sheets
    syncPaymentToSheet({
      receiptNo: `${updatedPayment.receiptNo} (EDITED)`,
      studentName: updatedPayment.studentName,
      studentPhone: updatedPayment.studentPhone,
      amount: updatedPayment.amount,
      paymentMode: updatedPayment.paymentMode,
      purpose: updatedPayment.purpose,
      description: updatedPayment.description,
      installmentNo: updatedPayment.installmentNo,
      totalFee: updatedPayment.feeRecord?.totalFee || null,
      paidSoFar: updatedPayment.feeRecord?.paidAmount || null,
      remainingBalance: updatedPayment.feeRecord?.remainingAmount || null,
      recordedBy: session.user.name || "Admin",
      paidAt: updatedPayment.paidAt.toISOString(),
    }).catch(() => {});

    return NextResponse.json(updatedPayment);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update payment";
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
