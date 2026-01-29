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
    // In real implementation, this would check the user's status from the server
    // For now, we'll just show the pending state
    setTimeout(() => {
      setStatus("pending");
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const statusContent = {
    checking: {
      icon: <RefreshCw className="w-16 h-16 text-blue-500 animate-spin" />,
      title: "Checking Status",
      description: "Please wait while we check your approval status...",
      color: "blue",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">{current.icon}</div>
            <CardTitle className="text-2xl font-bold">{current.title}</CardTitle>
            <CardDescription className="text-base">
              {current.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {status === "pending" && (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">What happens next?</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Admin will review your details</li>
                    <li>• You'll receive an email notification</li>
                    <li>• Once approved, you can login</li>
                  </ul>
                </div>
                <Button
                  onClick={checkStatus}
                  variant="outline"
                  className="w-full"
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
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Go to Login
              </Button>
            )}

            {status === "rejected" && (
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = "mailto:muhammedadnan50007@gmail.com"}
                  className="w-full"
                >
                  Contact Support
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="w-full"
                >
                  Go to Homepage
                </Button>
              </div>
            )}

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Need help?{" "}
                <a href="tel:9844942547" className="text-blue-600 hover:underline">
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
