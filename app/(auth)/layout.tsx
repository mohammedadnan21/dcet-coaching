import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="animate-pulse text-stone-500">Loading...</div>
      </div>
    }>
      {children}
    </Suspense>
  );
}
