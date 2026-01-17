"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/fetcher";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { usePopup } from "@/providers/popup-provider";

interface Offer {
    id_offre: number;
    intitule_offre: string;
    type_contrat: string;
    etat_offre: string;
    duree_validite?: number;
    duree_contrat?: number;
    date_debut_contrat?: string;
    date_fin_contrat?: string;
    adresse_offre: string;
    remuneration_offre?: number;
    pays: string;
    entreprise_nom: string;
}

const CONTRACT_TYPES = [
    { value: "stage", label: "Stage" },
    { value: "CDD", label: "CDD" },
    { value: "alternance", label: "Alternance" },
];

export default function SearchOffers() {
    const { get } = useApi();
    const { openPopup } = usePopup();

    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [selectedType, setSelectedType] = useState<string>("all");

    const fetchOffers = async (typeContrat?: string) => {
        setLoading(true);
        setErrorMsg("");
        try {
            const url =
                typeContrat && typeContrat !== "all"
                    ? `offers/available/search?type=${typeContrat}`
                    : "offers/available/search";
            const res = await get(url);
            const data = await res.json();
            if (res.ok) {
                setOffers(data);
            } else {
                setErrorMsg(data.message || "Erreur lors du chargement des offres");
            }
        } catch (error) {
            setErrorMsg("Erreur lors du chargement des offres");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchOffers();
    }, []);

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        fetchOffers(type);
    };

    const handleViewDetails = (offer: Offer) => {
        openPopup(
            <div className="w-full max-w-2xl bg-white rounded-xl p-6 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                    {offer.intitule_offre}
                </h2>

                <div className="space-y-4 border-b pb-6 div-group">
                    <div>
                        <p className="text-sm font-semibold text-gray-600">Entreprise</p>
                        <p className="text-lg text-gray-900">{offer.entreprise_nom}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Type de contrat</p>
                            <p className="text-gray-900">{offer.type_contrat}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Localisation</p>
                            <p className="text-gray-900">
                                {offer.adresse_offre}, {offer.pays}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-b pb-6 div-group">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Début</p>
                            <p className="text-gray-900">
                                {new Date(offer.date_debut_contrat || "").toLocaleDateString(
                                    "fr-FR"
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Fin</p>
                            <p className="text-gray-900">
                                {new Date(offer.date_fin_contrat || "").toLocaleDateString(
                                    "fr-FR"
                                )}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-600">Durée du contrat</p>
                        <p className="text-gray-900">{offer.duree_contrat} jours</p>
                    </div>
                </div>

                <div className="space-y-4 div-group">
                    <div>
                        <p className="text-sm font-semibold text-gray-600">Rémunération</p>
                        <p className="text-gray-900">
                            {offer.remuneration_offre ? `${offer.remuneration_offre} €` : "Non définie"}
                        </p>
                    </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Postuler
                </Button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Chargement des offres...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Rechercher des offres</h2>
            </div>

            {errorMsg && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {errorMsg}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="type_contrat">Type de contrat</Label>
                    <Select value={selectedType} onValueChange={handleTypeChange}>
                        <SelectTrigger id="type_contrat">
                            <SelectValue placeholder="Tous les types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les types</SelectItem>
                            {CONTRACT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {offers.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Aucune offre disponible</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {offers.map((offer) => (
                        <div
                            key={offer.id_offre}
                            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {offer.intitule_offre}
                                    </h3>
                                    <p className="text-gray-600 font-medium mb-3">
                                        {offer.entreprise_nom}
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="font-semibold">Type:</span> {offer.type_contrat}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Localisation:</span>{" "}
                                            {offer.adresse_offre}, {offer.pays}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Rémunération:</span>{" "}
                                            {offer.remuneration_offre ? `${offer.remuneration_offre} €` : "Non définie"}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Durée:</span> {offer.duree_contrat} jours
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleViewDetails(offer)}
                                    className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                                >
                                    Voir le détail
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
