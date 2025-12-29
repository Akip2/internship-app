"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/homepage/header";
import ContentTabs from "@/components/homepage/content-tabs";
import { Tab } from "@/lib/types";

const tabs: Tab[] = [
  {
    label: "Gestion des comptes",
    content: AccountsTab()
  },

  {
    label: "Archives",
    content: ArchivesTab()
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

function AccountsTab() {
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold">Gestion des comptes</h2>

      {/* ENSEIGNANT RESPONSABLE */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">
          Enseignant Responsable
        </h3>

        <div className="flex items-center justify-between">
          <span>Nom Enseignant Responsable Actuel</span>
          <Button>Modifier</Button>
        </div>

        <Button className="bg-green-600 hover:bg-green-700">
          Créer un compte Enseignant Responsable
        </Button>
      </Card>

      {/* SECRETAIRES */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Secrétaire(s)</h3>

        {["Nom Secrétaire 1", "Nom Secrétaire 2"].map((name) => (
          <div
            key={name}
            className="flex items-center justify-between"
          >
            <span>{name}</span>
            <div className="flex gap-2">
              <Button>Modifier</Button>
              <Button className="bg-red-600 hover:bg-red-700">
                Archiver
              </Button>
            </div>
          </div>
        ))}

        <Button className="bg-green-600 hover:bg-green-700">
          Créer un compte Secrétaire
        </Button>
      </Card>
    </section>
  );
}

function ArchivesTab() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-2">Archives</h2>
      <p className="text-gray-500">
        Contenu des archives à venir…
      </p>
    </Card>
  );
}
