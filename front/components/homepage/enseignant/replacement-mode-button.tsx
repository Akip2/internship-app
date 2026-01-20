"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/fetcher";
import { useSession } from "@/providers/session-provider";

interface Remplacement {
    id_remplacement: number;
    id_secretaire: number;
    id_enseignant: number;
    date_debut: string;
    date_fin: string;
}

export default function ReplacementModeButton() {
    const { get } = useApi();
    const { tempSecretaireMode, setTempSecretaireMode } = useSession();
    const [activeRemplacement, setActiveRemplacement] = useState<Remplacement | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurrentReplacements();
    }, []);

    const fetchCurrentReplacements = async () => {
        setLoading(true);
        try {
            const res = await get("remplacements");
            const data = await res.json();
            if (res.ok && data.length > 0) {
                setActiveRemplacement(data[0]);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des remplacements", error);
        } finally {
            setLoading(false);
        }
    };

    if (!activeRemplacement || loading) {
        return null;
    }

    const handleToggleMode = () => {
        setTempSecretaireMode(!tempSecretaireMode);
    };

    const startDate = new Date(activeRemplacement.date_debut).toLocaleDateString('fr-FR');
    const endDate = new Date(activeRemplacement.date_fin).toLocaleDateString('fr-FR');

    return (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold">Remplacement Actif</p>
                    <p className="text-sm">
                        Remplacement en cours du {startDate} au {endDate}
                    </p>
                </div>
                <Button
                    onClick={handleToggleMode}
                    variant={tempSecretaireMode ? "default" : "outline"}
                >
                    {tempSecretaireMode ? "Quitter le mode secrétaire" : "Activer le mode secrétaire"}
                </Button>
            </div>
        </div>
    );
}
