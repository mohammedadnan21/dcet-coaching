"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  UserCircle,
  Mail,
  Phone,
  CalendarDays,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Download,
} from "lucide-react";
import Link from "next/link";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

interface FeeRecord {
  id: string;
  totalFee: number;
  paidAmount: number;
  remainingAmount: number;
  feeType: string;
  status: string;
  createdAt: string;
}

interface Payment {
  id: string;
  receiptNo: string;
  amount: number;
  paymentMode: string;
  purpose: string;
  installmentNo: number | null;
  paidAt: string;
}

interface FeeSummary {
  totalFee: number;
  totalPaid: number;
  totalRemaining: number;
  isFullyPaid: boolean;
  hasPayments: boolean;
}

export default function StudentProfilePage() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/student/profile");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setFeeRecords(data.feeRecords);
          setPayments(data.payments);
          setFeeSummary(data.feeSummary);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-stone-400">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-400">Failed to load profile</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-6 bg-stone-950 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-stone-400 mt-1">Your account details and payment information</p>
      </div>

      <Tabs defaultValue={searchParams.get("tab") || "info"} className="space-y-4">
        <TabsList className="bg-stone-900 border border-amber-900/15">
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="fees">My Fees</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="info">
          <Card className="border border-amber-900/15 bg-stone-900">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                  <Badge className="bg-amber-900/25 text-amber-400 mt-1">Student</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-4 bg-stone-800 rounded-lg">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-xs text-stone-500">Email</p>
                    <p className="text-white font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-stone-800 rounded-lg">
                  <Phone className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-xs text-stone-500">Phone</p>
                    <p className="text-white font-medium">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-stone-800 rounded-lg">
                  <CalendarDays className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-xs text-stone-500">Joined</p>
                    <p className="text-white font-medium">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-stone-800 rounded-lg">
                  <UserCircle className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-xs text-stone-500">Account Status</p>
                    <Badge className="bg-green-900/25 text-green-400">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees">
          {!feeSummary || !feeSummary.hasPayments ? (
            <Card className="border border-amber-900/15 bg-stone-900">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Receipt className="w-16 h-16 mx-auto mb-4 text-stone-600" />
                  <h3 className="text-lg font-semibold text-stone-300">No Payment Records</h3>
                  <p className="text-stone-500 mt-2">
                    Your payment records will appear here once the admin records your fees.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Fee Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border border-amber-900/15 bg-stone-900">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-amber-900/20">
                        <IndianRupee className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm text-stone-400">Total Fee</p>
                        <p className="text-xl font-bold text-white">
                          ₹{feeSummary.totalFee.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-green-900/20 bg-stone-900">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-green-900/20">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-stone-400">Paid</p>
                        <p className="text-xl font-bold text-green-400">
                          ₹{feeSummary.totalPaid.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border ${feeSummary.totalRemaining > 0 ? "border-red-900/20" : "border-green-900/20"} bg-stone-900`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${feeSummary.totalRemaining > 0 ? "bg-red-900/20" : "bg-green-900/20"}`}>
                        {feeSummary.totalRemaining > 0 ? (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-stone-400">Remaining</p>
                        <p className={`text-xl font-bold ${feeSummary.totalRemaining > 0 ? "text-red-400" : "text-green-400"}`}>
                          {feeSummary.totalRemaining > 0
                            ? `₹${feeSummary.totalRemaining.toLocaleString("en-IN")}`
                            : "Fully Paid"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Bar */}
              {feeRecords.length > 0 && (
                <Card className="border border-amber-900/15 bg-stone-900">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-stone-400">Payment Progress</p>
                      <p className="text-sm font-medium text-amber-400">
                        {Math.round((feeSummary.totalPaid / feeSummary.totalFee) * 100)}%
                      </p>
                    </div>
                    <div className="w-full bg-stone-800 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-green-500 h-2.5 rounded-full transition-all"
                        style={{ width: `${Math.min((feeSummary.totalPaid / feeSummary.totalFee) * 100, 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment History */}
              <Card className="border border-amber-900/15 bg-stone-900">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Receipt No</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Mode</TableHead>
                          <TableHead>Installment</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-center">Slip</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-mono text-amber-400 text-sm">{payment.receiptNo}</TableCell>
                            <TableCell>
                              {new Date(payment.paidAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell>{purposeLabels[payment.purpose] || payment.purpose}</TableCell>
                            <TableCell>
                              <Badge className="bg-stone-800 text-stone-300 text-xs">
                                {modeLabels[payment.paymentMode] || payment.paymentMode}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {payment.installmentNo ? (
                                <Badge className="bg-cyan-900/25 text-cyan-400">#{payment.installmentNo}</Badge>
                              ) : (
                                <span className="text-stone-500 text-sm">Full</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-400">
                              ₹{payment.amount.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell className="text-center">
                              <Link
                                href={`/student/receipt/${payment.id}`}
                                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 hover:underline"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
