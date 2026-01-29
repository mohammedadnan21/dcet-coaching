"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";

type Step = "details" | "otp" | "password" | "success";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") || "student";

  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const role = roleParam.toUpperCase() as "STUDENT" | "TEACHER";

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // For development - show OTP if email not configured
      if (data.otp) {
        setDevOtp(data.otp);
      }

      toast({
        title: "OTP Sent!",
        description: data.message,
      });
      setStep("otp");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Email Verified!",
        description: "Now set your password",
      });
      setStep("password");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStep("success");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <p className="text-gray-600 mt-2">
            Create your {role.toLowerCase()} account
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center">
              {step !== "details" && step !== "success" && (
                <button
                  onClick={() => setStep(step === "password" ? "otp" : "details")}
                  className="mr-2 p-1 hover:bg-gray-100 rounded"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <CardTitle className="text-2xl font-bold">
                {step === "details" && "Create Account"}
                {step === "otp" && "Verify Email"}
                {step === "password" && "Set Password"}
                {step === "success" && "Registration Complete!"}
              </CardTitle>
            </div>
            <CardDescription>
              {step === "details" && "Enter your details to get started"}
              {step === "otp" && `Enter the 6-digit code sent to ${email}`}
              {step === "password" && "Create a strong password for your account"}
              {step === "success" && "Your account has been created successfully"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "details" && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                {devOtp && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm">
                    <strong>Dev Mode:</strong> Your OTP is <code className="bg-amber-100 px-2 py-1 rounded">{devOtp}</code>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    className="h-11 text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>

                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading || otp.length !== 6}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Didn't receive code?{" "}
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="text-blue-600 hover:underline"
                    disabled={loading}
                  >
                    Resend
                  </button>
                </p>
              </form>
            )}

            {step === "password" && (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <ul className="text-xs text-gray-500 space-y-1 mt-2">
                    <li className={password.length >= 8 ? "text-green-600" : ""}>
                      • At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                      • One uppercase letter
                    </li>
                    <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
                      • One lowercase letter
                    </li>
                    <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>
                      • One number
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}>
                      • One special character
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500">Passwords don't match</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "Setting Password..." : "Set Password"}
                </Button>
              </form>
            )}

            {step === "success" && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Account Created!</h3>
                <p className="text-gray-600 mb-6">
                  Your account is pending admin approval. You will be able to access the platform once approved.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/verify-queue")}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Check Status
                  </Button>
                  <Button
                    onClick={() => router.push("/login")}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                </div>
              </div>
            )}

            {step === "details" && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href={`/login?role=${roleParam}`} className="text-blue-600 hover:underline font-medium">
                    Sign In
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
