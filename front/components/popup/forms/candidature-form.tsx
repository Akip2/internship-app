"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePopup } from "@/providers/popup-provider";
import { Input } from "@/components/ui/input";
import { useApi } from "@/lib/fetcher";

export default function CandidatureForm(props: {
  offerId: number;
  offerTitle: string;
  onCandidatureCreated: () => void;
}) {
  const { offerId, offerTitle, onCandidatureCreated } = props;
  const { closePopup } = usePopup();

  const {get, post} = useApi();

  const [form, setForm] = useState({
    cvFile: null as File | null,
    letterFile: null as File | null,
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (field: 'cvFile' | 'letterFile') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("Le fichier ne doit pas dépasser 10MB");
        return;
      }
      setForm((prev) => ({ ...prev, [field]: file }));
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const formData = new FormData();
      if (form.cvFile) {
        formData.append('cv', form.cvFile);
      }
      if (form.letterFile) {
        formData.append('lettre_motivation', form.letterFile);
      }

      const res = await post(`candidatures/${offerId}`, formData, true);

      const data = await res.json();

      if (res.ok) {
        alert("Candidature envoyée");
        closePopup();
        onCandidatureCreated();
      } else {
        setErrorMsg(data.message || "Erreur lors de l'envoi de la candidature");
      }
    } catch (error) {
      setErrorMsg("Erreur lors de l'envoi de la candidature");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl bg-white rounded-xl space-y-4 p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Candidater à : {offerTitle}
      </h2>

      {errorMsg && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      {/* CV */}
      <div className="space-y-4 border-b pb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Ajouter un CV
            <span className="text-gray-500 font-normal"> (optionnel)</span>
          </label>
          <Input
            type="file"
            onChange={handleFileChange('cvFile')}
            accept=".pdf,.doc,.docx"
          />
          {form.cvFile && (
            <p className="text-sm text-green-600 mt-2">{form.cvFile.name}</p>
          )}
        </div>
      </div>

      <div className="space-y-4 border-b pb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Ajouter une lettre de motivation
            <span className="text-gray-500 font-normal"> (optionnel)</span>
          </label>
          <Input
            type="file"
            onChange={handleFileChange('letterFile')}
            accept=".pdf,.doc,.docx"
          />
          {form.letterFile && (
            <p className="text-sm text-green-600 mt-2">{form.letterFile.name}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Envoyer la candidature
        </Button>
      </div>
    </form>
  );
}
