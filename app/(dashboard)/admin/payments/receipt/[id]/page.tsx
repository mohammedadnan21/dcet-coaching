"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer, Download, Share2 } from "lucide-react";

interface PaymentDetail {
  id: string;
  receiptNo: string;
  studentName: string;
  studentPhone: string;
  amount: number;
  paymentMode: string;
  purpose: string;
  description: string | null;
  installmentNo: number | null;
  paidAt: string;
  createdAt: string;
  student: { name: string; email: string; phone: string };
  recordedBy: { name: string };
  feeRecord: {
    totalFee: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    feeType: string;
  } | null;
}

function numberToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero";

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }

  return convert(Math.floor(num)) + " Rupees Only";
}

export default function ReceiptPage() {
  const params = useParams();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await fetch(`/api/admin/payments/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPayment(data);
        }
      } catch (error) {
        console.error("Failed to fetch payment:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Uses browser's print-to-PDF feature
    window.print();
  };

  const purposeLabels: Record<string, string> = {
    ADMISSION: "Admission Fee",
    MONTHLY_FEE: "Monthly Fee",
    MATERIAL_FEE: "Material/Book Fee",
    OTHER: "Other",
  };

  const modeLabels: Record<string, string> = {
    CASH: "Cash",
    UPI: "UPI",
    BANK_TRANSFER: "Bank Transfer",
    OTHER: "Other",
  };

  const handleShareWhatsApp = () => {
    if (!payment) return;
    const message = encodeURIComponent(
      `*Wintrix Academy - Payment Receipt*\n\n` +
      `Receipt No: ${payment.receiptNo}\n` +
      `Student: ${payment.studentName}\n` +
      `Amount Paid: ₹${payment.amount.toLocaleString("en-IN")}\n` +
      `Purpose: ${purposeLabels[payment.purpose] || payment.purpose}\n` +
      `Mode: ${modeLabels[payment.paymentMode] || payment.paymentMode}\n` +
      `Date: ${new Date(payment.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}\n` +
      (payment.feeRecord && payment.feeRecord.remainingAmount > 0
        ? `\nTotal Fee: ₹${payment.feeRecord.totalFee.toLocaleString("en-IN")}\nPaid So Far: ₹${payment.feeRecord.paidAmount.toLocaleString("en-IN")}\nRemaining: ₹${payment.feeRecord.remainingAmount.toLocaleString("en-IN")}\n`
        : "") +
      `\nThank you for your payment!\n\n_Powered by Wintrix Academy_\nFollow us: instagram.com/wintrixacademy`
    );
    const phone = payment.studentPhone.startsWith("+91")
      ? payment.studentPhone.replace(/\s/g, "")
      : `+91${payment.studentPhone.replace(/\s/g, "")}`;
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-stone-400">Loading receipt...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-400">Receipt not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Print Controls */}
      <div className="flex flex-wrap gap-3 print:hidden">
        <Button
          onClick={handleDownloadPDF}
          className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button
          onClick={handleShareWhatsApp}
          variant="outline"
          className="text-green-400 border-green-800/30 hover:bg-green-900/20"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Send on WhatsApp
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
      </div>

      {/* Receipt */}
      <div ref={receiptRef} className="max-w-2xl mx-auto print:max-w-none">
        <div className="bg-white text-black p-8 print:p-5 rounded-lg shadow-lg border-2 border-gray-300 print:shadow-none print:border-2 print:rounded-none">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
            <h1 className="text-2xl print:text-xl font-bold text-gray-900 uppercase tracking-wide">
              Wintrix Academy
            </h1>
            <p className="text-sm text-gray-600 mt-1">DCET Coaching Center</p>
            <div className="mt-2 bg-gray-900 text-white py-1 px-4 inline-block rounded-sm">
              <span className="text-sm font-semibold tracking-widest">PAYMENT RECEIPT</span>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Receipt No</p>
              <p className="font-bold text-base text-gray-900">{payment.receiptNo}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase">Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(payment.paidAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4">
            <h3 className="text-xs text-gray-500 uppercase mb-1 font-semibold">Student Details</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-semibold text-gray-900 text-sm">{payment.studentName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900 text-sm">{payment.studentPhone}</p>
              </div>
              {payment.student?.email && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-gray-700 text-sm">{payment.student.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details Table */}
          <div className="mb-4">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-1.5 text-left text-xs uppercase text-gray-600">Description</th>
                  <th className="border border-gray-300 px-3 py-1.5 text-right text-xs uppercase text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    <p className="font-medium text-sm">
                      {purposeLabels[payment.purpose] || payment.purpose}
                      {payment.installmentNo && (
                        <span className="ml-2 text-xs text-gray-500">(Installment #{payment.installmentNo})</span>
                      )}
                    </p>
                    {payment.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{payment.description}</p>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-gray-900 text-white">
                  <td className="border border-gray-300 px-3 py-1.5 font-semibold text-sm">Amount Paid</td>
                  <td className="border border-gray-300 px-3 py-1.5 text-right font-bold">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in Words */}
          <div className="mb-4 border border-gray-200 rounded p-2 bg-gray-50">
            <p className="text-xs text-gray-500 uppercase">Amount in Words</p>
            <p className="font-medium text-gray-800 italic text-sm">{numberToWords(payment.amount)}</p>
          </div>

          {/* Fee Summary (for installment payments) */}
          {payment.feeRecord && (
            <div className="mb-4 border-2 border-dashed border-gray-300 rounded p-3">
              <h3 className="text-xs text-gray-500 uppercase mb-2 font-semibold">Fee Summary</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">Total Fee</p>
                  <p className="font-bold text-gray-900">₹{payment.feeRecord.totalFee.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Paid</p>
                  <p className="font-bold text-green-700">₹{payment.feeRecord.paidAmount.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Balance Due</p>
                  <p className={`font-bold ${payment.feeRecord.remainingAmount > 0 ? "text-red-600" : "text-green-700"}`}>
                    ₹{payment.feeRecord.remainingAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              {payment.feeRecord.remainingAmount > 0 && (
                <p className="text-center text-xs text-red-600 mt-1 font-medium">
                  * Balance of ₹{payment.feeRecord.remainingAmount.toLocaleString("en-IN")} is pending
                </p>
              )}
              {payment.feeRecord.remainingAmount <= 0 && (
                <p className="text-center text-xs text-green-700 mt-1 font-medium">
                  ✓ Fee Fully Paid
                </p>
              )}
            </div>
          )}

          {/* Payment Mode & Received By */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Payment Mode</p>
              <p className="font-semibold text-sm">{modeLabels[payment.paymentMode] || payment.paymentMode}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Received By</p>
              <p className="font-semibold text-sm">{payment.recordedBy.name}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 pt-2">
            <p className="text-xs text-gray-400">This is a computer generated receipt. No signature required.</p>
          </div>

          {/* Branding */}
          <div className="mt-3 pt-2 border-t border-gray-200 text-center">
            <p className="text-xs font-semibold text-gray-700">Powered by Wintrix Academy</p>
            <a
              href="https://www.instagram.com/wintrixacademy?igsh=MWlseXJjMjE3cGR0Zw=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              @wintrixacademy
            </a>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          html, body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0 !important;
            padding: 0 !important;
          }
          aside, nav, header, [class*="sidebar"], .print\\:hidden {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
