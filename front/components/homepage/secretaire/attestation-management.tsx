"use client";

import { getAttestation, useApi } from "@/lib/fetcher";
import { UserAccount } from "@/lib/types";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { usePopup } from "@/providers/popup-provider";

type AttestationItem = {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    attestation_chemin: string | null;
    niveau_etu: string;
};

export default function AttestationManagement(props: { className?: string }) {
    const { className } = props;
    const { get, put } = useApi();
    const { openPopup } = usePopup();

    const [attestations, setAttestations] = useState<AttestationItem[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchAttestations() {
        const res = await get("attestations/available");
        if (!res.ok) return;
        const data = await res.json();
        console.log(data);
        setAttestations(data);
    }

    async function handleValidate(userId: number) {
        try {
            const res = await put(`attestations/validate`, { id_utilisateur: userId });
            if (res.ok) {
                await fetchAttestations();
            } else {
                console.error("Erreur lors de la validation");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAttestations();
    }, []);

    return (
        <section className={clsx("space-y-4", className)}>
            <h2 className="text-2xl font-semibold mb-4">
                Attestations de Responsabilité Civile à valider
            </h2>

            {attestations.length === 0 && <p>Aucune attestation à valider.</p>}

            <ul className="space-y-2">
                {attestations.map((item, idx) => (
                    <li
                        key={idx}
                        className="flex items-center justify-between p-6 bg-white rounded-lg shadow "
                    >
                        <div>
                            <p>
                                <span className="font-semibold">{item.nom}</span>{" "}
                                {item.prenom}
                            </p>
                            <p>Niveau : {item.niveau_etu}</p>
                        </div>

                        <div className="flex gap-2">
                            {item.attestation_chemin && (
                                <button
                                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                    onClick={() =>
                                        openPopup(<img src={`${getAttestation(item.attestation_chemin ?? "")}`} alt="Attestation" width={600} height={800} />)
                                    }
                                >
                                    Voir
                                </button>
                            )}

                            <button
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                onClick={() => handleValidate(item.id_utilisateur)}
                                disabled={loading}
                            >
                                Valider
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
