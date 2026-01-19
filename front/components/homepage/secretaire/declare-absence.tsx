"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/fetcher";

interface Enseignant {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    email: string;
}

interface Remplacement {
    id_remplacement: number;
    id_secretaire: number;
    id_enseignant: number;
    date_debut: string;
    date_fin: string;
    nom_enseignant: string;
    prenom_enseignant: string;
}

export default function DeclareAbsence() {
    const { get, post, deleteAPI } = useApi();

    const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
    const [remplacements, setRemplacements] = useState<Remplacement[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        id_enseignant: "",
        date_debut: getTodayDate(),
        date_fin: "",
    });

    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        fetchEnseignants();
        fetchRemplacements();
    }, []);

    const fetchEnseignants = async () => {
        try {
            const res = await get("accounts/enseignant");
            const data = await res.json();
            if (res.ok) {
                setEnseignants(data);
            } else {
                setErrorMsg("Erreur lors du chargement des enseignants");
            }
        } catch (error) {
            setErrorMsg("Erreur lors du chargement des enseignants");
        }
    };

    const fetchRemplacements = async () => {
        try {
            const res = await get("remplacements");
            const data = await res.json();
            if (res.ok) {
                setRemplacements(data);
            } else {
                setErrorMsg("Erreur lors du chargement des remplacements");
            }
        } catch (error) {
            setErrorMsg("Erreur lors du chargement des remplacements");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!formData.id_enseignant || !formData.date_debut || !formData.date_fin) {
            setErrorMsg("Veuillez remplir tous les champs");
            return;
        }

        setSubmitting(true);
        try {
            const res = await post("remplacements", JSON.stringify({
                id_enseignant: parseInt(formData.id_enseignant),
                date_debut: formData.date_debut,
                date_fin: formData.date_fin,
            }));

            if (res.ok) {
                alert("Absence déclarée avec succès");
                setFormData({ id_enseignant: "", date_debut: "", date_fin: "" });
                fetchRemplacements();
            }
        } catch (error) {
            setErrorMsg("Erreur lors de la déclaration");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (idRemplacement: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce remplacement?")) {
            return;
        }

        try {
            const res = await deleteAPI(`remplacements/${idRemplacement}`);
            if (res.ok) {
                setSuccessMsg("Remplacement supprimé avec succès");
                fetchRemplacements();
            } else {
                const data = await res.json();
                setErrorMsg(data.message || "Erreur lors de la suppression");
            }
        } catch (error) {
            setErrorMsg("Erreur lors de la suppression");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Formulaire de déclaration d'absence */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Déclarer une absence
                </h2>

                {errorMsg && (
                    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg mb-4">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="id_enseignant" className="block font-semibold mb-2">
                            Enseignant remplaçant *
                        </label>
                        <select
                            id="id_enseignant"
                            name="id_enseignant"
                            value={formData.id_enseignant}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Sélectionner un enseignant --</option>
                            {enseignants.map((ens) => (
                                <option key={ens.id_utilisateur} value={ens.id_utilisateur}>
                                    {ens.prenom} {ens.nom}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date_debut" className="block font-semibold mb-2">
                                Date de début *
                            </label>
                            <input
                                type="date"
                                id="date_debut"
                                name="date_debut"
                                value={formData.date_debut}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="date_fin" className="block font-semibold mb-2">
                                Date de fin *
                            </label>
                            <input
                                type="date"
                                id="date_fin"
                                name="date_fin"
                                value={formData.date_fin}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        {"Déclarer l'absence"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
