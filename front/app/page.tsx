"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";
import Header from "@/components/homepage/header";
import ContentTabs from "@/components/homepage/content-tabs";
import getTabs from "@/lib/tab-map";

export default function HomePage() {
  const { token, role, hydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;

    if (token.length === 0) {
      router.push("/login");
    } 
  }, [token, hydrated, router]);

  if (token.length === 0 || !hydrated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <ContentTabs tabs={getTabs(role)} />
    </div>
  );
}
