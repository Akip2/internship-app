"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/fetcher";
import { usePopup } from "@/providers/popup-provider";
import ReplacementModeButton from "./replacement-mode-button";
import { UserRole } from "@/enums/user-role";
import { useSession } from "@/providers/session-provider";

interface Offer {
    id_offre: number;
    intitule_offre: string;
    type_contrat: string;
    etat_offre: string;
    date_debut_contrat?: string;
    date_fin_contrat?: string;
    adresse_offre: string;
    remuneration_offre?: number;
    pays: string;
    entreprise_nom: string;
}

export default function OffersToValidate() {
    const { get, put } = useApi();
    const { openPopup } = usePopup();

    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchOffers = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await get("offers/validation/pending");
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

    const handleViewDetails = (offer: Offer) => {
        openPopup(
            <OfferValidationDetail
                offer={offer}
                onValidate={() => handleValidate(offer.id_offre)}
                onReject={() => handleReject(offer.id_offre)}
            />
        );
    };

    const handleValidate = async (offerId: number) => {
        try {
            const res = await put(`offers/${offerId}/validate`, {});
            const data = await res.json();
            if (res.ok) {
                alert("Offre validée avec succès");
                fetchOffers();
            } else {
                alert("Erreur: " + (data.message || "Erreur lors de la validation"));
            }
        } catch (error) {
            alert("Erreur lors de la validation");
        }
    };

    const handleReject = async (offerId: number) => {
        try {
            const res = await put(`offers/${offerId}/reject`, {});
            const data = await res.json();
            if (res.ok) {
                alert("Offre refusée");
                fetchOffers();
            } else {
                alert("Erreur: " + (data.message || "Erreur lors du refus"));
            }
        } catch (error) {
            alert("Erreur lors du refus de l'offre");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Chargement des offres...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ReplacementModeButton />

            {errorMsg && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {errorMsg}
                </div>
            )}

            {offers.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                        Aucune offre en attente de validation
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {offers.map((offer) => (
                        <div
                            key={offer.id_offre}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                        >
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                    {offer.intitule_offre} - {offer.entreprise_nom}
                                </p>
                            </div>
                            <Button
                                onClick={() => handleViewDetails(offer)}
                                className="bg-blue-600 hover:bg-blue-700 ml-4"
                            >
                                Voir les détails
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function OfferValidationDetail(props: {
    offer: Offer;
    onValidate: () => void;
    onReject: () => void;
}) {
    const { offer, onValidate, onReject } = props;
    const { closePopup } = usePopup();

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Non défini";
        return new Date(dateString).toLocaleDateString("fr-FR");
    };

    return (
        <div className="w-full max-w-2xl bg-white rounded-xl space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
                Détails de l'offre
            </h2>

            <div className="space-y-4 border-b pb-6 div-group">
                <div>
                    <p className="text-sm font-semibold text-gray-600">Intitulé</p>
                    <p className="text-lg text-gray-900">{offer.intitule_offre}</p>
                </div>

                <div>
                    <p className="text-sm font-semibold text-gray-600">Entreprise</p>
                    <p className="text-lg text-gray-900">{offer.entreprise_nom}</p>
                </div>
            </div>

            <div className="space-y-4 border-b pb-6 div-group">
                <div>
                    <p className="text-sm font-semibold text-gray-600">Adresse</p>
                    <p className="text-gray-900">{offer.adresse_offre}</p>
                </div>

                <div>
                    <p className="text-sm font-semibold text-gray-600">Pays</p>
                    <p className="text-gray-900">{offer.pays}</p>
                </div>
            </div>

            {/* Section dates et durée */}
            <div className="space-y-4 border-b pb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-600">Date de début</p>
                        <p className="text-gray-900">{formatDate(offer.date_debut_contrat)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-600">Date de fin</p>
                        <p className="text-gray-900">{formatDate(offer.date_fin_contrat)}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 div-group">
                <div>
                    <p className="text-sm font-semibold text-gray-600">Rémunération</p>
                    <p className="text-gray-900">
                        {offer.remuneration_offre ? `${offer.remuneration_offre} €` : "Non définie"}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-600">Type de contrat</p>
                        <p className="text-gray-900">{offer.type_contrat}</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-6 border-t">
                <Button
                    onClick={() => {
                        onValidate();
                        closePopup();
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                >
                    Valider
                </Button>
                <Button
                    onClick={() => {
                        onReject();
                        closePopup();
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                >
                    Refuser
                </Button>
            </div>
        </div>
    );
}
