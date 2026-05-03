"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, User, Mail, Phone, Calendar } from "lucide-react";

interface PendingUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

interface PendingUsersResponse {
  items: PendingUser[];
  total: number;
  page: number;
  limit: number;
}

export default function ApprovalsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch("/api/admin/users?status=PENDING&limit=100");
      if (!response.ok) throw new Error("Failed to fetch");
      const data: PendingUsersResponse = await response.json();
      setUsers(data.items);
    } catch (error) {
      console.error("Failed to fetch pending users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: string, approve: boolean) => {
    setProcessing(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          status: approve ? "APPROVED" : "REJECTED",
        }),
      });

      if (response.ok) {
        toast({
          title: approve ? "User Approved" : "User Rejected",
          description: approve
            ? "The user can now access the platform"
            : "The user has been rejected",
        });
        fetchPendingUsers();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process approval",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6 bg-stone-950 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-white">Pending Approvals</h1>
        <p className="text-stone-400 mt-1">Review and approve new user registrations</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-stone-500">Loading pending approvals...</p>
        </div>
      ) : users.length === 0 ? (
        <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
            <p className="text-stone-400">No pending approvals at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id} className="border border-amber-900/15 bg-stone-900 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-900/25 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">{user.name}</CardTitle>
                      <Badge className="mt-1 bg-amber-900/30 text-amber-400 border border-amber-700/30">{user.role}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-stone-400">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-400">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-400">
                  <Calendar className="w-4 h-4" />
                  <span>Applied {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2 pt-3">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproval(user.id, true)}
                    disabled={processing === user.id}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleApproval(user.id, false)}
                    disabled={processing === user.id}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
