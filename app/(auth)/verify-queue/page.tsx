"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Logo } from "@/components/logo";

export default function VerifyQueuePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "pending" | "approved" | "rejected">("checking");
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) throw new Error("Failed to fetch");
      const session = await res.json();
      if (session?.user?.status === "APPROVED") {
        setStatus("approved");
      } else if (session?.user?.status === "REJECTED") {
        setStatus("rejected");
      } else {
        setStatus("pending");
      }
    } catch {
      setStatus("pending");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const statusContent = {
    checking: {
      icon: <RefreshCw className="w-16 h-16 text-amber-500 animate-spin" />,
      title: "Checking Status",
      description: "Please wait while we check your approval status...",
      color: "amber",
    },
    pending: {
      icon: <Clock className="w-16 h-16 text-amber-500" />,
      title: "Pending Approval",
      description: "Your account is awaiting admin approval. This usually takes 24-48 hours. You will receive an email once your account is approved.",
      color: "amber",
    },
    approved: {
      icon: <CheckCircle className="w-16 h-16 text-green-500" />,
      title: "Account Approved!",
      description: "Congratulations! Your account has been approved. You can now login to access the platform.",
      color: "green",
    },
    rejected: {
      icon: <XCircle className="w-16 h-16 text-red-500" />,
      title: "Account Rejected",
      description: "Unfortunately, your account has been rejected. Please contact support for more information.",
      color: "red",
    },
  };

  const current = statusContent[status];

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
        </div>

        <Card className="shadow-xl border border-amber-900/15 bg-stone-900">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">{current.icon}</div>
            <CardTitle className="text-2xl font-bold text-white">{current.title}</CardTitle>
            <CardDescription className="text-base text-stone-400">
              {current.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {status === "pending" && (
              <>
                <div className="bg-amber-900/15 border border-amber-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-400 mb-2">What happens next?</h4>
                  <ul className="text-sm text-stone-400 space-y-1">
                    <li>• Admin will review your details</li>
                    <li>• You'll receive an email notification</li>
                    <li>• Once approved, you can login</li>
                  </ul>
                </div>
                <Button
                  onClick={checkStatus}
                  variant="outline"
                  className="w-full border-amber-900/20 text-stone-400 hover:bg-stone-800/50 hover:text-white"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh Status
                </Button>
              </>
            )}

            {status === "approved" && (
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
              >
                Go to Login
              </Button>
            )}

            {status === "rejected" && (
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = "mailto:muhammedadnan50007@gmail.com"}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
                >
                  Contact Support
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="w-full border-amber-900/20 text-stone-400 hover:bg-stone-800/50 hover:text-white"
                >
                  Go to Homepage
                </Button>
              </div>
            )}

            <div className="text-center pt-4 border-t border-amber-900/20">
              <p className="text-sm text-stone-400">
                Need help?{" "}
                <a href="tel:9844942547" className="text-amber-500 hover:text-amber-400 hover:underline">
                  Call us: 9844942547
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
