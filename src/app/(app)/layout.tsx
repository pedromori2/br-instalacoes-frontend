"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/sidebar";
import { PageSpinner } from "@/components/ui/spinner";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <PageSpinner />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="h-screen flex-1 overflow-y-auto bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
