"use client";

import { useApi } from "@/lib/fetcher";
import { UserAccount } from "@/lib/types";
import { useEffect, useState } from "react";

export default function AttestationManagement(props: { className?: string }) {
    const { className } = props;
    const { get } = useApi();

    const [secretaries, setSecretaries] = useState<UserAccount[]>([]);

    async function fetchAttestations() {
        const attestations = await get("attestations");

        if (attestations.ok) {
            const res = await attestations.json()
            setSecretaries(res);
        }
    }

    useEffect(() => {
        fetchAttestations();
    }, []);

    return (
        <section className={`space-y-8 ${className ?? ""}`}>
            <h2 className="text-2xl font-semibold">Attestations de Responsabilité Civile à valider</h2>
        </section>
    );
}
