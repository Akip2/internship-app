"use client";

import { useEffect } from "react";
import { useSession } from "@/providers/session-provider";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const { token: id } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!id) {
            router.push("/login");
        }
    }, [id, router]);

    if (!id) {
        return null;
    }

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-6">
            <header className="flex items-center justify-between py-4 border-b">
                <h1 className="text-2xl font-bold">OptiMatch</h1>
                <div className="text-gray-500">Bonjour, Utilisateur</div>
            </header>
        </div>
    );
}
