"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Search, Plus, Receipt, IndianRupee, AlertCircle, CheckCircle2, Clock, Pencil } from "lucide-react";

interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface FeeRecordPayment {
  id: string;
  receiptNo: string;
  amount: number;
  paymentMode: string;
  installmentNo: number | null;
  paidAt: string;
}

interface FeeRecord {
  id: string;
  studentId: string;
  totalFee: number;
  paidAmount: number;
  remainingAmount: number;
  feeType: string;
  status: string;
  description: string | null;
  createdAt: string;
  student: { id: string; name: string; phone: string; email: string };
  payments: FeeRecordPayment[];
}

interface Payment {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  amount: number;
  paymentMode: string;
  purpose: string;
  description: string | null;
  installmentNo: number | null;
  paidAt: string;
  createdAt: string;
  recordedBy: { name: string };
  feeRecord: { totalFee: number; paidAmount: number; remainingAmount: number; status: string } | null;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalCollected, setTotalCollected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInstallmentDialog, setShowInstallmentDialog] = useState(false);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<FeeRecord | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentType, setPaymentType] = useState<"full" | "installment">("full");
  const [formData, setFormData] = useState({
    amount: "",
    totalFee: "",
    paymentMode: "CASH",
    purpose: "ADMISSION",
    description: "",
  });
  const [installmentForm, setInstallmentForm] = useState({
    amount: "",
    paymentMode: "CASH",
    description: "",
  });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    paymentMode: "CASH",
    purpose: "ADMISSION",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchFeeRecords();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", "1");
      params.set("limit", "50");

      const response = await fetch(`/api/admin/payments?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setPayments(data.items);
      setTotalPayments(data.total);
      setTotalCollected(data.totalCollected || 0);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeRecords = async () => {
    try {
      const response = await fetch("/api/admin/fee-records?limit=50");
      if (response.ok) {
        const data = await response.json();
        setFeeRecords(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch fee records:", error);
    }
  };

  const searchStudents = async (query: string) => {
    if (query.length < 2) {
      setStudents([]);
      return;
    }
    try {
      const params = new URLSearchParams({
        search: query,
        page: "1",
        limit: "10",
      });
      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.items);
      }
    } catch (error) {
      console.error("Failed to search students:", error);
    }
  };

  const handleStudentSearch = (value: string) => {
    setStudentSearch(value);
    searchStudents(value);
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentSearch(student.name);
    setStudents([]);
  };

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast({ title: "Error", description: "Please select a student", variant: "destructive" });
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (paymentType === "installment") {
      if (!formData.totalFee || parseFloat(formData.totalFee) <= 0) {
        toast({ title: "Error", description: "Please enter the total fee", variant: "destructive" });
        return;
      }
      if (parseFloat(formData.amount) > parseFloat(formData.totalFee)) {
        toast({ title: "Error", description: "Payment amount cannot exceed total fee", variant: "destructive" });
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        studentId: selectedStudent.id,
        amount: formData.amount,
        paymentMode: formData.paymentMode,
        purpose: formData.purpose,
        description: formData.description || undefined,
      };

      if (paymentType === "installment") {
        payload.totalFee = formData.totalFee;
      }

      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to record payment");
      }

      const payment = await response.json();
      toast({ title: "Payment Recorded!", description: `Receipt No: ${payment.receiptNo}` });

      setShowAddDialog(false);
      resetForm();
      fetchPayments();
      fetchFeeRecords();

      window.open(`/admin/payments/receipt/${payment.id}`, "_blank");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to record payment";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayInstallment = async () => {
    if (!selectedFeeRecord) return;
    if (!installmentForm.amount || parseFloat(installmentForm.amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    if (parseFloat(installmentForm.amount) > selectedFeeRecord.remainingAmount) {
      toast({
        title: "Error",
        description: `Amount cannot exceed remaining balance of ₹${selectedFeeRecord.remainingAmount.toLocaleString("en-IN")}`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedFeeRecord.studentId,
          amount: installmentForm.amount,
          paymentMode: installmentForm.paymentMode,
          purpose: selectedFeeRecord.feeType,
          description: installmentForm.description || `Installment payment`,
          feeRecordId: selectedFeeRecord.id,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to record payment");
      }

      const payment = await response.json();
      toast({ title: "Installment Recorded!", description: `Receipt No: ${payment.receiptNo}` });

      setShowInstallmentDialog(false);
      setSelectedFeeRecord(null);
      setInstallmentForm({ amount: "", paymentMode: "CASH", description: "" });
      fetchPayments();
      fetchFeeRecords();

      window.open(`/admin/payments/receipt/${payment.id}`, "_blank");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to record payment";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setStudentSearch("");
    setPaymentType("full");
    setFormData({ amount: "", totalFee: "", paymentMode: "CASH", purpose: "ADMISSION", description: "" });
  };

  const openEditDialog = (payment: Payment) => {
    setEditingPayment(payment);
    setEditForm({
      amount: String(payment.amount),
      paymentMode: payment.paymentMode,
      purpose: payment.purpose,
      description: payment.description || "",
    });
    setShowEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!editingPayment) return;
    if (!editForm.amount || parseFloat(editForm.amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: editingPayment.id,
          amount: editForm.amount,
          paymentMode: editForm.paymentMode,
          purpose: editForm.purpose,
          description: editForm.description,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update payment");
      }

      toast({ title: "Payment Updated!", description: `Receipt ${editingPayment.receiptNo} has been corrected.` });
      setShowEditDialog(false);
      setEditingPayment(null);
      fetchPayments();
      fetchFeeRecords();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update payment";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getModeBadge = (mode: string) => {
    const variants: Record<string, string> = {
      CASH: "bg-green-900/25 text-green-400",
      UPI: "bg-blue-900/25 text-blue-400",
      BANK_TRANSFER: "bg-purple-900/25 text-purple-400",
      OTHER: "bg-stone-800/50 text-stone-400",
    };
    return <Badge className={variants[mode] || ""}>{mode}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === "PAID") return <Badge className="bg-green-900/25 text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />Paid</Badge>;
    if (status === "PARTIAL") return <Badge className="bg-amber-900/25 text-amber-400"><Clock className="w-3 h-3 mr-1" />Partial</Badge>;
    return <Badge className="bg-red-900/25 text-red-400"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  const pendingRecords = feeRecords.filter((r) => r.status !== "PAID");

  return (
    <div className="space-y-6 bg-stone-950 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Payments</h1>
          <p className="text-stone-400 mt-1">Record and manage student payments & installments</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-amber-900/15 bg-stone-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-900/20">
                <IndianRupee className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-stone-400">Total Collected</p>
                <p className="text-2xl font-bold text-white">
                  ₹{totalCollected.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-amber-900/15 bg-stone-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-900/20">
                <Receipt className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-stone-400">Total Receipts</p>
                <p className="text-2xl font-bold text-white">{totalPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-amber-900/15 bg-stone-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-900/20">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-stone-400">Pending Balance</p>
                <p className="text-2xl font-bold text-white">
                  ₹{pendingRecords.reduce((sum, r) => sum + r.remainingAmount, 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-amber-900/15 bg-stone-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-900/20">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-stone-400">Installment Students</p>
                <p className="text-2xl font-bold text-white">{pendingRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all-payments" className="space-y-4">
        <TabsList className="bg-stone-900 border border-amber-900/15">
          <TabsTrigger value="all-payments">All Payments</TabsTrigger>
          <TabsTrigger value="pending-balance" className="relative">
            Pending Balance
            {pendingRecords.length > 0 && (
              <span className="ml-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pendingRecords.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All Payments Tab */}
        <TabsContent value="all-payments">
          <Card className="border border-amber-900/15 bg-stone-900 shadow-md overflow-hidden">
            <CardHeader>
              <div className="flex gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <Input
                    placeholder="Search by name, phone, or receipt no..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchPayments()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={fetchPayments} className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
                  Search
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt No</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Installment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-stone-500">No payments recorded yet</TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-amber-400">{payment.receiptNo}</TableCell>
                          <TableCell className="font-medium">{payment.studentName}</TableCell>
                          <TableCell>{payment.studentPhone}</TableCell>
                          <TableCell className="font-semibold text-green-400">₹{payment.amount.toLocaleString("en-IN")}</TableCell>
                          <TableCell>{getModeBadge(payment.paymentMode)}</TableCell>
                          <TableCell>
                            {payment.installmentNo ? (
                              <Badge className="bg-cyan-900/25 text-cyan-400">#{payment.installmentNo}</Badge>
                            ) : (
                              <Badge className="bg-stone-800/50 text-stone-400">Full</Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(payment.paidAt).toLocaleDateString("en-IN")}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-stone-400 border-stone-700 hover:bg-stone-800 hover:text-white"
                                onClick={() => openEditDialog(payment)}
                              >
                                <Pencil className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-amber-400 border-amber-800/30 hover:bg-amber-900/20"
                                onClick={() => window.open(`/admin/payments/receipt/${payment.id}`, "_blank")}
                              >
                                <Receipt className="w-3 h-3 mr-1" />
                                Slip
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Balance Tab */}
        <TabsContent value="pending-balance">
          <Card className="border border-amber-900/15 bg-stone-900 shadow-md overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white">Students with Pending Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRecords.length === 0 ? (
                <div className="text-center py-8 text-stone-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/30" />
                  <p>All fees are fully paid! No pending balance.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRecords.map((record) => (
                    <div key={record.id} className="border border-stone-700 rounded-lg p-4 hover:border-amber-800/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{record.student.name}</h3>
                          <p className="text-sm text-stone-400">{record.student.phone}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(record.status)}
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedFeeRecord(record);
                              setShowInstallmentDialog(true);
                            }}
                            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Pay Installment
                          </Button>
                        </div>
                      </div>

                      {/* Fee Progress */}
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-stone-500">Total Fee</p>
                          <p className="font-bold text-white">₹{record.totalFee.toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500">Paid</p>
                          <p className="font-bold text-green-400">₹{record.paidAmount.toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500">Remaining</p>
                          <p className="font-bold text-red-400">₹{record.remainingAmount.toLocaleString("en-IN")}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-stone-800 rounded-full h-2 mb-3">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${(record.paidAmount / record.totalFee) * 100}%` }}
                        />
                      </div>

                      {/* Payment History */}
                      {record.payments.length > 0 && (
                        <div className="mt-3 border-t border-stone-700 pt-3">
                          <p className="text-xs text-stone-500 mb-2">Payment History ({record.payments.length} installments)</p>
                          <div className="flex flex-wrap gap-2">
                            {record.payments.map((p) => (
                              <div key={p.id} className="text-xs bg-stone-800 rounded px-2 py-1 flex items-center gap-1">
                                <span className="text-stone-400">#{p.installmentNo}</span>
                                <span className="text-green-400 font-medium">₹{p.amount.toLocaleString("en-IN")}</span>
                                <span className="text-stone-500">{new Date(p.paidAt).toLocaleDateString("en-IN")}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Payment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record New Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Student Search */}
            <div className="space-y-2">
              <Label>Student Name</Label>
              <div className="relative">
                <Input
                  placeholder="Type student name to search..."
                  value={studentSearch}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                />
                {students.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-stone-800 border border-stone-700 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {students.map((s) => (
                      <button
                        key={s.id}
                        className="w-full px-3 py-2 text-left hover:bg-stone-700 text-sm"
                        onClick={() => handleSelectStudent(s)}
                      >
                        <span className="text-white">{s.name}</span>
                        <span className="text-stone-400 ml-2">({s.phone})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedStudent && (
                <p className="text-xs text-green-400">Selected: {selectedStudent.name} - {selectedStudent.phone}</p>
              )}
            </div>

            {/* Payment Type */}
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select value={paymentType} onValueChange={(v) => setPaymentType(v as "full" | "installment")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Payment</SelectItem>
                  <SelectItem value="installment">Installment (Partial Payment)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Total Fee (only for installment) */}
            {paymentType === "installment" && (
              <div className="space-y-2">
                <Label>Total Fee (₹)</Label>
                <Input
                  type="number"
                  placeholder="Enter total course fee"
                  value={formData.totalFee}
                  onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
                />
                <p className="text-xs text-stone-500">
                  The full fee amount. Remaining will be tracked automatically.
                </p>
              </div>
            )}

            {/* Amount Paying Now */}
            <div className="space-y-2">
              <Label>{paymentType === "installment" ? "Amount Paying Now (₹)" : "Amount (₹)"}</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              {paymentType === "installment" && formData.totalFee && formData.amount && (
                <p className="text-xs text-amber-400">
                  Remaining after this: ₹{(parseFloat(formData.totalFee) - parseFloat(formData.amount)).toLocaleString("en-IN")}
                </p>
              )}
            </div>

            {/* Payment Mode */}
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select value={formData.paymentMode} onValueChange={(v) => setFormData({ ...formData, paymentMode: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Select value={formData.purpose} onValueChange={(v) => setFormData({ ...formData, purpose: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMISSION">Admission Fee</SelectItem>
                  <SelectItem value="MONTHLY_FEE">Monthly Fee</SelectItem>
                  <SelectItem value="MATERIAL_FEE">Material/Book Fee</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                placeholder="Any additional notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
            >
              {submitting ? "Recording..." : "Record & Generate Slip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Installment Dialog */}
      <Dialog open={showInstallmentDialog} onOpenChange={(open) => { setShowInstallmentDialog(open); if (!open) { setSelectedFeeRecord(null); setInstallmentForm({ amount: "", paymentMode: "CASH", description: "" }); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Installment Payment</DialogTitle>
          </DialogHeader>
          {selectedFeeRecord && (
            <div className="space-y-4 py-4">
              {/* Student Info */}
              <div className="bg-stone-800 rounded-lg p-3">
                <p className="font-semibold text-white">{selectedFeeRecord.student.name}</p>
                <p className="text-sm text-stone-400">{selectedFeeRecord.student.phone}</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <p className="text-xs text-stone-500">Total</p>
                    <p className="text-sm font-bold text-white">₹{selectedFeeRecord.totalFee.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Paid</p>
                    <p className="text-sm font-bold text-green-400">₹{selectedFeeRecord.paidAmount.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Remaining</p>
                    <p className="text-sm font-bold text-red-400">₹{selectedFeeRecord.remainingAmount.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label>Amount Paying Now (₹)</Label>
                <Input
                  type="number"
                  placeholder={`Max: ₹${selectedFeeRecord.remainingAmount.toLocaleString("en-IN")}`}
                  value={installmentForm.amount}
                  onChange={(e) => setInstallmentForm({ ...installmentForm, amount: e.target.value })}
                />
                {installmentForm.amount && (
                  <p className="text-xs text-amber-400">
                    After this payment, remaining: ₹{(selectedFeeRecord.remainingAmount - parseFloat(installmentForm.amount || "0")).toLocaleString("en-IN")}
                  </p>
                )}
              </div>

              {/* Payment Mode */}
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={installmentForm.paymentMode} onValueChange={(v) => setInstallmentForm({ ...installmentForm, paymentMode: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Note (Optional)</Label>
                <Input
                  placeholder="Any note..."
                  value={installmentForm.description}
                  onChange={(e) => setInstallmentForm({ ...installmentForm, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowInstallmentDialog(false); setSelectedFeeRecord(null); }}>Cancel</Button>
            <Button
              onClick={handlePayInstallment}
              disabled={submitting}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
            >
              {submitting ? "Recording..." : "Record & Generate Slip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) setEditingPayment(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          {editingPayment && (
            <div className="space-y-4 py-4">
              <div className="bg-stone-800 rounded-lg p-3">
                <p className="font-semibold text-white">{editingPayment.studentName}</p>
                <p className="text-sm text-stone-400">Receipt: {editingPayment.receiptNo}</p>
              </div>

              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                />
                {editForm.amount !== String(editingPayment.amount) && (
                  <p className="text-xs text-amber-400">
                    Changing from ₹{editingPayment.amount.toLocaleString("en-IN")} → ₹{parseFloat(editForm.amount || "0").toLocaleString("en-IN")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={editForm.paymentMode} onValueChange={(v) => setEditForm({ ...editForm, paymentMode: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Purpose</Label>
                <Select value={editForm.purpose} onValueChange={(v) => setEditForm({ ...editForm, purpose: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMISSION">Admission Fee</SelectItem>
                    <SelectItem value="MONTHLY_FEE">Monthly Fee</SelectItem>
                    <SelectItem value="MATERIAL_FEE">Material/Book Fee</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Any notes..."
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingPayment(null); }}>Cancel</Button>
            <Button
              onClick={handleEditSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
