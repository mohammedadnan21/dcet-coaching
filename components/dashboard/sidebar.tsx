"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Logo, LogoIcon } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  Calendar,
  MessageCircle,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  UserCheck,
  GraduationCap,
  Trophy,
  Bot,
  PlusCircle,
} from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface SidebarProps {
  role: "admin" | "teacher" | "student";
}

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/approvals", label: "Pending Approvals", icon: UserCheck },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/videos", label: "Videos", icon: Video },
  { href: "/admin/meetings", label: "Meetings", icon: Calendar },
  { href: "/admin/tests", label: "Mock Tests", icon: ClipboardList },
  { href: "/admin/questions", label: "Q&A", icon: MessageCircle },
];

const teacherLinks: SidebarLink[] = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/subjects", label: "My Subjects", icon: BookOpen },
  { href: "/teacher/videos", label: "Videos", icon: Video },
  { href: "/teacher/meetings", label: "Meetings", icon: Calendar },
  { href: "/teacher/tests", label: "Mock Tests", icon: ClipboardList },
  { href: "/teacher/questions", label: "Student Questions", icon: MessageCircle },
];

const studentLinks: SidebarLink[] = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/subjects", label: "Subjects", icon: BookOpen },
  { href: "/student/videos", label: "Videos", icon: Video },
  { href: "/student/meetings", label: "Live Classes", icon: Calendar },
  { href: "/student/tests", label: "Mock Tests", icon: ClipboardList },
  { href: "/student/rankings", label: "Rankings", icon: Trophy },
  { href: "/student/ask", label: "Ask Question", icon: MessageCircle },
  { href: "/student/chatbot", label: "AI Assistant", icon: Bot },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const links = role === "admin" ? adminLinks : role === "teacher" ? teacherLinks : studentLinks;

  const SidebarContent = () => (
    <div className={cn("flex flex-col h-full", collapsed ? "w-16" : "w-64")}>
      {/* Logo */}
      <div className="p-4 border-b flex items-center justify-between">
        {collapsed ? <LogoIcon /> : <Logo size="sm" />}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="font-medium">{link.label}</span>
                      {link.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="p-4 border-t">
        {!collapsed && session?.user && (
          <div className="mb-3">
            <p className="font-semibold text-gray-900 truncate">{session.user.name}</p>
            <p className="text-sm text-gray-500 truncate">{session.user.email}</p>
          </div>
        )}
        <Button
          variant="outline"
          className={cn("w-full justify-start gap-2", collapsed && "justify-center p-2")}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex h-screen bg-white border-r sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
