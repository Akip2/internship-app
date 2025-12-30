"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";
import Header from "@/components/homepage/header";
import ContentTabs from "@/components/homepage/content-tabs";
import { Tab } from "@/lib/types";
import AccountManagement from "@/components/homepage/admin/account-management";

const tabs: Tab[] = [
  {
    label: "Gestion des comptes",
    content: <AccountManagement/>
  },

  {
    label: "Archives",
    content: null
  }
]

export default function HomePage() {
  const { token } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (token.length === 0) {
      router.push("/login");
    }
  }, [token, router]);

  if (token.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <ContentTabs tabs={tabs} />
    </div>
  );
}
