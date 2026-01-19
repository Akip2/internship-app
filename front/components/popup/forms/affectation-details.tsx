import { Button } from "@/components/ui/button";
import { Affectation } from "@/lib/types";
import { usePopup } from "@/providers/popup-provider";
import { useState } from "react";

export default function AffectationValidationDetail({
  affectation,
  onValidate,
  onReject,
}: {
  affectation: Affectation;
  onValidate: () => void;
  onReject: (justification: string) => void;
}) {
  const { closePopup } = usePopup();
  const [justification, setJustification] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleRejectSubmit = () => {
    if (!justification.trim()) {
      alert("Veuillez fournir une justification");
      return;
    }
    onReject(justification);
  };

  if (showRejectForm) {
    return (
      <div className="w-full max-w-2xl bg-white rounded-xl p-6 space-y-6">
        <h2 className="text-2xl font-bold">
          Justifier le refus pour {affectation.prenom_etudiant} {affectation.nom_etudiant}
        </h2>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Offre:</span>{" "}
            {affectation.intitule_offre}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="justification" className="block font-semibold">
            Justification du refus *
          </label>
          <textarea
            id="justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRejectSubmit}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Confirmer le refus
          </button>
          <button
            onClick={() => setShowRejectForm(false)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl p-6 space-y-6">
      <h2 className="text-2xl font-bold">
        Détails affectation - {affectation.prenom_etudiant}{" "}
        {affectation.nom_etudiant}
      </h2>

      <div className="space-y-4">
        <div className="p-4 rounded-lg space-y-2">
          <h3 className="font-bold text-gray-900 mb-3">Informations étudiant</h3>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Prénom:</span>{" "}
            {affectation.prenom_etudiant}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Nom:</span>{" "}
            {affectation.nom_etudiant}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Niveau:</span>{" "}
            {affectation.niveau_etu}
          </p>
        </div>

        <div className="p-4 rounded-lg space-y-2">
          <h3 className="font-bold text-gray-900 mb-3">Détails de l'offre</h3>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Intitulé:</span>{" "}
            {affectation.intitule_offre}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Type de contrat:</span>{" "}
            {affectation.type_contrat}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Adresse:</span>{" "}
            {affectation.adresse_offre}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Rémunération:</span>{" "}
            {affectation.remuneration_offre
              ? `${affectation.remuneration_offre}€`
              : "Non spécifiée"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Date début:</span>{" "}
              {new Date(affectation.date_debut_contrat).toLocaleDateString("fr-FR")}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Date fin:</span>{" "}
              {new Date(affectation.date_fin_contrat).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Date de candidature:</span>{" "}
            {new Date(affectation.date_candidature).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onValidate}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Valider
        </Button>
        <Button
          onClick={() => setShowRejectForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Refuser
        </Button>
      </div>
    </div>
  );
}
