"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/fetcher";

interface Candidature {
  id_candidature: number;
  etat_candidature: string;
  lettre_motivation_chemin: string | null;
  date_candidature: string;
  cv_chemin: string | null;
  id_offre: number;
  intitule_offre: string;
  type_contrat: string;
  adresse_offre: string;
  pays: string;
  raison_sociale: string;
}

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  acceptee: "Acceptée",
  refusee: "Refusée",
};

const STATUS_COLORS: Record<string, string> = {
  en_attente: "bg-yellow-100 text-yellow-800",
  acceptee: "bg-green-100 text-green-800",
  refusee: "bg-red-100 text-red-800",
};

export default function MyCandidatures() {
  const { get } = useApi();

  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCandidatures = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await get("candidatures/my");
      const data = await res.json();
      if (res.ok) {
        setCandidatures(data);
      } else {
        setErrorMsg(
          data.message || "Erreur lors du chargement des candidatures"
        );
      }
    } catch (error) {
      setErrorMsg("Erreur lors du chargement des candidatures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatures();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chargement de vos candidatures...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mes candidatures</h2>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errorMsg}
        </div>
      )}

      {candidatures.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Vous n'avez pas encore postulé à une offre
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {candidatures.map((candidature) => (
            <div
              key={candidature.id_candidature}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {candidature.intitule_offre}
                  </h3>
                  <p className="text-gray-600 font-medium mb-3">
                    {candidature.raison_sociale}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-semibold">Type:</span>{" "}
                      {candidature.type_contrat}
                    </div>
                    <div>
                      <span className="font-semibold">Localisation:</span>{" "}
                      {candidature.adresse_offre}, {candidature.pays}
                    </div>
                    <div>
                      <span className="font-semibold">Date candidature:</span>{" "}
                      {new Date(candidature.date_candidature).toLocaleDateString(
                        "fr-FR"
                      )}
                    </div>
                    <div>
                      <span className="font-semibold">Documents:</span>{" "}
                      <div className="flex gap-2 mt-1">
                        {candidature.cv_chemin && (
                          <a
                            href={candidature.cv_chemin}
                            download
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                          >
                            CV
                          </a>
                        )}
                        {candidature.lettre_motivation_chemin && (
                          <a
                            href={candidature.lettre_motivation_chemin}
                            download
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                          >
                            Lettre
                          </a>
                        )}
                        {!candidature.cv_chemin &&
                        !candidature.lettre_motivation_chemin ? (
                          <span className="text-gray-500 text-xs">Aucun document</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      STATUS_COLORS[candidature.etat_candidature] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {STATUS_LABELS[candidature.etat_candidature] ||
                      candidature.etat_candidature}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
