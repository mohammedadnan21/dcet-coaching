"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Search, Trash2, Filter } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
}

interface UsersListResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (roleFilter) params.set("role", roleFilter);
        if (statusFilter) params.set("status", statusFilter);
        if (search) params.set("search", search);
        params.set("page", "1");
        params.set("limit", "20");

        const response = await fetch(`/api/admin/users?${params}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data: UsersListResponse = await response.json();
        setUsers(data.items);
        setTotalUsers(data.total);
        setPage(1);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("page", "1");
      params.set("limit", "20");

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data: UsersListResponse = await response.json();
      setUsers(data.items);
      setTotalUsers(data.total);
      setPage(1);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreUsers = async () => {
    const nextPage = page + 1;
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("page", String(nextPage));
      params.set("limit", "20");

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data: UsersListResponse = await response.json();
      setUsers((prev) => [...prev, ...data.items]);
      setTotalUsers(data.total);
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more users:", error);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "User status updated" });
        fetchUsers();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user status", variant: "destructive" });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "User role updated" });
        fetchUsers();
      } else {
        throw new Error("Failed to update role");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user role", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.user) return;

    try {
      const response = await fetch(`/api/admin/users?userId=${deleteDialog.user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Success", description: "User deleted successfully" });
        fetchUsers();
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    } finally {
      setDeleteDialog({ open: false, user: null });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: "bg-amber-900/25 text-amber-400",
      APPROVED: "bg-green-900/25 text-green-400",
      REJECTED: "bg-red-900/25 text-red-400",
    };
    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      ADMIN: "bg-purple-900/25 text-purple-400",
      TEACHER: "bg-amber-900/30 text-amber-400 border border-amber-700/30",
      STUDENT: "bg-stone-800/50 text-stone-400",
    };
    return <Badge className={variants[role] || ""}>{role}</Badge>;
  };

  return (
    <div className="space-y-6 bg-stone-950 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-stone-400 mt-1">Manage all users on the platform</p>
      </div>

      <Card className="border border-amber-900/15 bg-stone-900 shadow-md overflow-hidden">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
                Search
              </Button>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-stone-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-[110px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STUDENT">Student</SelectItem>
                          <SelectItem value="TEACHER">Teacher</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.status}
                        onValueChange={(value) => handleStatusChange(user.id, value)}
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-400 hover:bg-red-900/15"
                        onClick={() => setDeleteDialog({ open: true, user })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!loading && users.length < totalUsers && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMoreUsers}>
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteDialog.user?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, user: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
