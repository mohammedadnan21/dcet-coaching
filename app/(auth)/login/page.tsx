"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, GraduationCap, Shield, BookOpen } from "lucide-react";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState(searchParams.get("role") || "student");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("PENDING") || result.error === "PENDING_APPROVAL") {
          router.push("/verify-queue");
          return;
        }
        toast({
          title: "Login Failed",
          description: result.error === "CredentialsSignin" ? "Invalid email or password" : result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Login successful",
        });
        
        const res = await fetch("/api/auth/session");
        if (!res.ok) throw new Error("Failed to fetch");
        const session = await res.json();
        const role = session?.user?.role;

        if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "TEACHER") {
          router.push("/teacher");
        } else {
          router.push("/student");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    student: <GraduationCap className="w-5 h-5" />,
    teacher: <BookOpen className="w-5 h-5" />,
    admin: <Shield className="w-5 h-5" />,
  };

  const roleDescriptions = {
    student: "Access your courses, take tests, and track progress",
    teacher: "Manage subjects, upload content, and create tests",
    admin: "Full platform management and user approvals",
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <p className="text-stone-400 mt-2">Sign in to continue learning</p>
        </div>

        <Card className="shadow-xl border border-amber-900/20 bg-stone-900">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-white">Welcome Back</CardTitle>
            <CardDescription className="text-center text-stone-400">
              Choose your role and sign in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  {roleIcons.student}
                  <span className="hidden sm:inline">Student</span>
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-2">
                  {roleIcons.teacher}
                  <span className="hidden sm:inline">Teacher</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  {roleIcons.admin}
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              </TabsList>

              <p className="text-sm text-stone-500 text-center mb-6">
                {roleDescriptions[activeTab as keyof typeof roleDescriptions]}
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Tabs>

            {activeTab !== "admin" && (
              <div className="mt-6 text-center">
                <p className="text-sm text-stone-400">
                  Don&apos;t have an account?{" "}
                  <Link href={`/register?role=${activeTab}`} className="text-amber-500 hover:text-amber-400 hover:underline font-medium">
                    Create Account
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
