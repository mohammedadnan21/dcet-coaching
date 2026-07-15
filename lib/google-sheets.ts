const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL;

interface PaymentSheetData {
  receiptNo: string;
  studentName: string;
  studentPhone: string;
  amount: number;
  paymentMode: string;
  purpose: string;
  description: string | null;
  installmentNo: number | null;
  totalFee: number | null;
  paidSoFar: number | null;
  remainingBalance: number | null;
  recordedBy: string;
  paidAt: string;
}

export async function syncPaymentToSheet(data: PaymentSheetData): Promise<void> {
  if (!GOOGLE_SHEET_WEBHOOK_URL) {
    console.warn("GOOGLE_SHEET_WEBHOOK_URL not set, skipping sheet sync");
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        receiptNo: data.receiptNo,
        studentName: data.studentName,
        studentPhone: data.studentPhone,
        amount: data.amount,
        paymentMode: data.paymentMode,
        purpose: data.purpose,
        description: data.description || "",
        installmentNo: data.installmentNo || "Full",
        totalFee: data.totalFee || data.amount,
        paidSoFar: data.paidSoFar || data.amount,
        remainingBalance: data.remainingBalance || 0,
        recordedBy: data.recordedBy,
        date: new Date(data.paidAt).toLocaleDateString("en-IN"),
        time: new Date(data.paidAt).toLocaleTimeString("en-IN"),
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error("Failed to sync to Google Sheet:", response.statusText);
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Google Sheet sync timed out (5s)");
    } else {
      console.error("Error syncing to Google Sheet:", error);
    }
  }
}
