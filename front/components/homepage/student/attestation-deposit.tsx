"use client";

import { getAttestation, useApi } from "@/lib/fetcher";
import clsx from "clsx";
import { useEffect, useState } from "react";

type Attestation = {
    attestation_chemin: string | null;
    attestation_rc: string | null;
};

export default function AttestationDeposit(props: { className?: string }) {
    const { className } = props;
    const { get, post } = useApi();
    const [attestation, setAttestation] = useState<Attestation | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_BASE = `${process.env.NEXT_PUBLIC_API_HOST}:${process.env.NEXT_PUBLIC_API_PORT}`;


    async function fetchAttestation() {
        try {
            const res = await get("attestations/me");
            if (!res.ok) throw new Error("Erreur fetch attestation");

            const resJson = await res.json();
            console.log(resJson);
            setAttestation(resJson);
        } catch (err) {
            console.error(err);
            setError("Impossible de récupérer l'attestation.");
        }
    }

    useEffect(() => {
        fetchAttestation();
    }, []);

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setUploading(true);
        setError(null);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await post("attestations", formData, true);
            if (!uploadRes.ok) throw new Error("Upload échoué");

            setSuccess(true);

            // Re-fetch pour mettre à jour l'affichage
            const res = await get("attestations/me");
            setAttestation(await res.json());
        } catch (err) {
            console.error(err);
            setError("Échec de l'upload, réessayez.");
        } finally {
            setUploading(false);
        }
    }

    // Si aucune attestation ou non remontée, afficher le bouton déposer
    if (!attestation || attestation.attestation_rc === null || attestation.attestation_rc === "non_remontee") {
        return (
            <div className={clsx("p-4 max-w-md mx-auto", className)}>
                <h1 className="text-xl font-bold mb-4">Déposez votre attestation</h1>

                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    {uploading ? "Uploading..." : "Choisir un fichier"}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>

                {fileName && <p className="mt-2">Fichier sélectionné : {fileName}</p>}
                {success && <p className="mt-2 text-green-600">Upload réussi ✅</p>}
                {error && <p className="mt-2 text-red-600">{error}</p>}
            </div>
        );
    }

    return (
        <div className={clsx("p-4 max-w-md mx-auto space-y-4", className)}>
            <h1 className="text-xl font-bold">Votre attestation</h1>
            <p>Statut : {attestation.attestation_rc === 'validee' ? "Validée" : "En attente"}</p>

            {attestation.attestation_chemin ? (
                <img
                    src={`${getAttestation(attestation.attestation_chemin)}`}
                    alt="Attestation"
                    className="w-full rounded shadow mb-2"
                />
            ) : (
                <p>Aucune attestation disponible</p>
            )}
        </div>
    );
}
