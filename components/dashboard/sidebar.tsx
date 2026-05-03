"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  Menu,
  ChevronLeft,
  UserCheck,
  Trophy,
  Bot,
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

const apiMap: Record<string, string[]> = {
  "/admin/videos": ["/api/videos", "/api/subjects"],
  "/admin/meetings": ["/api/meetings"],
  "/admin/tests": ["/api/tests", "/api/subjects"],
  "/admin/users": ["/api/admin/users"],
  "/admin/questions": ["/api/questions"],
  "/admin/subjects": ["/api/subjects"],
  "/admin/approvals": ["/api/admin/users?status=PENDING"],
  "/admin": ["/api/admin/stats"],
  "/student/videos": ["/api/videos"],
  "/student/meetings": ["/api/meetings?upcoming=true"],
  "/student/tests": ["/api/tests"],
  "/student/rankings": ["/api/tests"],
  "/student": ["/api/meetings?upcoming=true", "/api/quotes/random"],
  "/teacher/videos": ["/api/videos"],
  "/teacher/meetings": ["/api/meetings"],
  "/teacher/tests": ["/api/tests"],
  "/teacher/questions": ["/api/questions"],
};

interface SidebarContentProps {
  links: SidebarLink[];
  pathname: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onPrefetch: (href: string) => void;
  session: { user?: { name?: string | null; email?: string | null } } | null;
}

function SidebarContent({ links, pathname, collapsed, onToggleCollapse, onPrefetch, session }: SidebarContentProps) {
  return (
    <div className={cn("flex flex-col h-full bg-stone-950", collapsed ? "w-16" : "w-64")}>
      <div className="p-4 border-b border-amber-900/20 flex items-center justify-between">
        {collapsed ? <LogoIcon /> : <Logo size="sm" />}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex text-stone-400 hover:text-amber-400 hover:bg-amber-900/20"
          onClick={onToggleCollapse}
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href} onMouseEnter={() => onPrefetch(link.href)}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-amber-900/25 text-amber-400 border border-amber-800/30"
                      : "text-stone-400 hover:bg-stone-800 hover:text-white border border-transparent"
                  )}
                >
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="font-medium">{link.label}</span>
                      {link.badge && (
                        <span className="ml-auto bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
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

      <div className="p-4 border-t border-amber-900/20">
        {!collapsed && session?.user && (
          <div className="mb-3">
            <p className="font-semibold text-white truncate">{session.user.name}</p>
            <p className="text-sm text-stone-500 truncate">{session.user.email}</p>
          </div>
        )}
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 border-stone-700 text-stone-400 hover:text-red-400 hover:border-red-900/50 hover:bg-red-900/10",
            collapsed && "justify-center p-2"
          )}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  );
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const links = role === "admin" ? adminLinks : role === "teacher" ? teacherLinks : studentLinks;

  const handlePrefetch = useCallback((href: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.prefetch(href);
      const urls = apiMap[href];
      if (urls) {
        urls.forEach((url) => fetch(url).catch(() => {}));
      }
    }, 150);
  }, [router]);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <>
      <aside className="hidden lg:flex h-screen bg-stone-950 border-r border-amber-900/20 sticky top-0">
        <SidebarContent
          links={links}
          pathname={pathname}
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          onPrefetch={handlePrefetch}
          session={session}
        />
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50 text-stone-300 hover:text-amber-400 bg-stone-900/80 backdrop-blur-sm border border-amber-900/20">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-stone-950 border-r border-amber-900/20">
          <SidebarContent
            links={links}
            pathname={pathname}
            collapsed={false}
            onToggleCollapse={handleToggleCollapse}
            onPrefetch={handlePrefetch}
            session={session}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
