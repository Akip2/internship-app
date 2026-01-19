"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/fetcher";
import { usePopup } from "@/providers/popup-provider";
import { Affectation } from "@/lib/types";
import AffectationValidationDetail from "../../popup/forms/affectation-details";

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente de validation",
  validee_par_enseignant: "Validée par enseignant",
  acceptee_par_entreprise: "Acceptée par entreprise",
  refusee: "Refusée",
};

const STATUS_COLORS: Record<string, string> = {
  en_attente: "bg-yellow-100 text-yellow-800",
  validee_par_enseignant: "bg-blue-100 text-blue-800",
  acceptee_par_entreprise: "bg-green-100 text-green-800",
  refusee: "bg-red-100 text-red-800",
};

export default function AffectationsToValidate() {
  const { get, put } = useApi();
  const { openPopup, closePopup } = usePopup();

  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAffectations = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await get("candidatures/validation/pending");
      const data = await res.json();
      if (res.ok) {
        setAffectations(data);
      } else {
        setErrorMsg(
          data.message || "Erreur lors du chargement des affectations"
        );
      }
    } catch (error) {
      setErrorMsg("Erreur lors du chargement des affectations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffectations();
  }, []);

  const handleViewDetails = (affectation: Affectation) => {
    openPopup(
      <AffectationValidationDetail
        affectation={affectation}
        onValidate={() => handleValidate(affectation.id_candidature)}
        onReject={(justification) => handleReject(affectation.id_candidature, justification)}
      />
    );
  };

  const handleValidate = async (candidatureId: number) => {
    try {
      const res = await put(`candidatures/${candidatureId}/validate-teacher`, {});
      const data = await res.json();
      if (res.ok) {
        alert("Affectation validée avec succès");
        fetchAffectations();
      } else {
        alert("Erreur: " + (data.message || "Erreur lors de la validation"));
      }
    } catch (error) {
      alert("Erreur lors de la validation");
    }
  };

  const handleReject = async (
    candidatureId: number,
    justification: string
  ) => {
    try {
      const res = await put(
        `candidatures/${candidatureId}/reject-teacher`, {}
      );
      if (res.ok) {
        alert("Affectation refusée");
        closePopup();
        fetchAffectations();
      } 
    } catch (error) {
      alert("Erreur lors du refus de l'affectation");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chargement des affectations...</p>
      </div>
    );
  }

  const pendingAffectations = affectations.filter(
    (a) => a.etat_candidature === "acceptee_par_entreprise"
  );

  return (
    <div className="space-y-8">
      <div>
        {errorMsg && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4">
            {errorMsg}
          </div>
        )}

        {pendingAffectations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">
              Aucune affectation à valider
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAffectations.map((affectation) => (
              <div
                key={affectation.id_candidature}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {affectation.prenom_etudiant} {affectation.nom_etudiant}
                    </h3>
                    <p className="text-gray-600 font-medium mb-3">
                      {affectation.intitule_offre}
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-semibold">Type contrat:</span>{" "}
                        {affectation.type_contrat}
                      </div>
                      <div>
                        <span className="font-semibold">Rémunération:</span>{" "}
                        {affectation.remuneration_offre
                          ? `${affectation.remuneration_offre}€`
                          : "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold">Niveau:</span>{" "}
                        {affectation.niveau_etu}
                      </div>
                      <div>
                        <span className="font-semibold">Début:</span>{" "}
                        {new Date(affectation.date_debut_contrat).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                      <div>
                        <span className="font-semibold">Fin:</span>{" "}
                        {new Date(affectation.date_fin_contrat).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                      <div>
                        <span className="font-semibold">
                          Candidature:
                        </span>{" "}
                        {new Date(affectation.date_candidature).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewDetails(affectation)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Voir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}