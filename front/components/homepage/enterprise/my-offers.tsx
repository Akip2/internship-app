"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/fetcher";
import { usePopup } from "@/providers/popup-provider";
import OfferForm from "@/components/popup/forms/offer-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Offer {
  id_offre: number;
  intitule_offre: string;
  type_contrat: string;
  etat_offre: string;
  candidatures_count: number;
  duree_validite?: number;
  duree_contrat?: number;
  date_debut_contrat?: string;
  date_fin_contrat?: string;
  adresse_offre: string;
  remuneration_offre?: number;
  pays: string;
}

const OFFER_STATUS_LABELS: Record<string, string> = {
  deposee: "Déposée",
  validee: "Validée",
  refusee: "Refusée",
  en_modification: "En modification",
  desactivee: "Désactivée",
};

const OFFER_STATUS_COLORS: Record<string, string> = {
  deposee: "bg-blue-100 text-blue-800",
  validee: "bg-green-100 text-green-800",
  refusee: "bg-red-100 text-red-800",
  en_modification: "bg-yellow-100 text-yellow-800",
  desactivee: "bg-gray-100 text-gray-800",
};

export default function MyOffers() {
  const { get, put } = useApi();
  const { openPopup } = usePopup();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchOffers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await get("offers");
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

  const handleCreateOffer = () => {
    openPopup(
      <OfferForm
        onOfferCreated={() => {
          fetchOffers();
        }}
      />
    );
  };

  const handleDisableOffer = async (offerId: number) => {
    try {
      const res = await put(`offers/${offerId}/disable`, {});
      const data = await res.json();
      if (res.ok) {
        alert("Offre désactivée avec succès");
        fetchOffers();
      } else {
        alert("Erreur: " + (data.message || "Erreur lors de la désactivation"));
      }
    } catch (error) {
      alert("Erreur lors de la désactivation de l'offre");
    }
  };

  const handleReactivateOffer = async (offerId: number) => {
    try {
      const res = await put(`offers/${offerId}/reactivate`, {});
      const data = await res.json();
      if (res.ok) {
        alert("Offre réactivée avec succès");
        fetchOffers();
      } else {
        alert("Erreur: " + (data.message || "Erreur lors de la réactivation"));
      }
    } catch (error) {
      alert("Erreur lors de la réactivation de l'offre");
    }
  };

  const handleViewCandidatures = async (offerId: number, offerTitle: string) => {
    try {
      const res = await get(`offers/${offerId}/candidatures`);
      const candidatures = await res.json();
      
      if (res.ok) {
        openPopup(
          <div className="w-full max-w-2xl bg-white rounded-xl p-6 space-y-4">
            <h2 className="text-2xl font-bold">
              Candidatures pour "{offerTitle}"
            </h2>
            
            {candidatures.length === 0 ? (
              <p className="text-gray-500">Aucune candidature</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {candidatures.map((cand: any) => (
                  <div
                    key={cand.id_candidature}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <p className="font-semibold">
                      {cand.prenom} {cand.nom}
                    </p>
                    <p className="text-sm text-gray-600">
                      État: {cand.etat_candidature}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
    } catch (error) {
      alert("Erreur lors du chargement des candidatures");
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
    <div className="space-y-6">
      {/* En-tête avec bouton */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes Offres</h2>
        <Button onClick={handleCreateOffer} className="bg-blue-600 hover:bg-blue-700">
          + Déposer une nouvelle offre
        </Button>
      </div>

      {/* Message d'erreur */}
      {errorMsg && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Tableau des offres */}
      {offers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Vous n'avez pas encore créé d'offre
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-900 px-6 py-3">
                  Offre
                </TableHead>
                <TableHead className="font-semibold text-gray-900 px-6 py-3">
                  Type
                </TableHead>
                <TableHead className="font-semibold text-gray-900 px-6 py-3">
                  Statut
                </TableHead>
                <TableHead className="font-semibold text-gray-900 px-6 py-3">
                  Candidatures
                </TableHead>
                <TableHead className="font-semibold text-gray-900 px-6 py-3">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow
                  key={offer.id_offre}
                  className="border-b hover:bg-gray-50"
                >
                  <TableCell className="px-6 py-4 font-medium text-gray-900">
                    {offer.intitule_offre}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-700">
                    {offer.type_contrat}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        OFFER_STATUS_COLORS[offer.etat_offre] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {OFFER_STATUS_LABELS[offer.etat_offre] || offer.etat_offre}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <button
                      onClick={() =>
                        handleViewCandidatures(
                          offer.id_offre,
                          offer.intitule_offre
                        )
                      }
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {offer.candidatures_count} {offer.candidatures_count > 1 ? 'candidatures' : 'candidature'}
                    </button>
                  </TableCell>
                  <TableCell className="px-6 py-4 space-x-2">
                    <Button
                      onClick={() => {
                        openPopup(
                          <OfferForm
                            offer={{
                              id_offre: offer.id_offre,
                              intitule_offre: offer.intitule_offre,
                              duree_validite: offer.duree_validite?.toString() || "12",
                              type_contrat: offer.type_contrat,
                              date_debut_contrat: offer.date_debut_contrat || "",
                              date_fin_contrat: offer.date_fin_contrat || "",
                              adresse_offre: offer.adresse_offre,
                              remuneration_offre: offer.remuneration_offre?.toString() || "",
                              pays: offer.pays,
                            }}
                            onOfferCreated={() => {
                              fetchOffers();
                            }}
                          />
                        );
                      }}
                      disabled={offer.etat_offre === 'validee' || offer.etat_offre === 'desactivee'}
                      className={offer.etat_offre === 'validee' || offer.etat_offre === 'desactivee' ? 'opacity-50 cursor-not-allowed' : ''}
                      title={offer.etat_offre === 'validee' ? 'Impossible de modifier une offre validée' : offer.etat_offre === 'desactivee' ? 'Impossible de modifier une offre désactivée' : 'Modifier l\'offre'}
                    >
                      Modifier
                    </Button>
                    {offer.etat_offre === 'desactivee' ? (
                      <Button
                        onClick={() => handleReactivateOffer(offer.id_offre)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Réactiver
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleDisableOffer(offer.id_offre)}
                        variant="destructive"
                      >
                        Désactiver
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
