import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ChatbotWidget } from "@/components/chatbot-widget";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?role=student");
  }

  if (session.user.status !== "APPROVED") {
    redirect("/verify-queue");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      <main className="flex-1 p-4 lg:p-8 lg:ml-0">{children}</main>
      <ChatbotWidget />
    </div>
  );
}
