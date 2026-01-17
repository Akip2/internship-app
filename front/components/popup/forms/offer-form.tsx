"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import InputDiv from "@/components/shared/input-div";
import { useApi } from "@/lib/fetcher";
import { usePopup } from "@/providers/popup-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDateFR, toInputDate } from "@/lib/utils";

type OfferFormData = {
  id_offre?: number;
  intitule_offre: string;
  duree_validite: string;
  type_contrat: string;
  date_debut_contrat: string;
  date_fin_contrat: string;
  adresse_offre: string;
  remuneration_offre: string;
  pays: string;
};

const CONTRAT_TYPES = [
  { value: "stage", label: "Stage" },
  { value: "CDD", label: "CDD" },
  { value: "alternance", label: "Alternance" },
];

export default function OfferForm(props: {
  offer?: OfferFormData;
  onOfferCreated: () => void;
}) {
  const { offer, onOfferCreated } = props;

  const { post, put } = useApi();
  const { closePopup } = usePopup();

  const [form, setForm] = useState<OfferFormData>(
    offer
      ? offer
      : {
          intitule_offre: "",
          duree_validite: "12",
          type_contrat: "",
          date_debut_contrat: "",
          date_fin_contrat: "",
          adresse_offre: "",
          remuneration_offre: "",
          pays: "",
        }
  );

  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation basique
    if (
      !form.intitule_offre ||
      !form.type_contrat ||
      !form.date_debut_contrat ||
      !form.adresse_offre ||
      !form.pays
    ) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Validation duree_validite (1-12)
    const dureeValidite = parseInt(form.duree_validite || "12");
    if (dureeValidite < 1 || dureeValidite > 12) {
      setErrorMsg("La durée de validité doit être entre 1 et 12 mois");
      return;
    }

    // Convertir les champs numériques
    const offerData = {
      intitule_offre: form.intitule_offre,
      duree_validite: dureeValidite,
      type_contrat: form.type_contrat,
      date_debut_contrat: form.date_debut_contrat,
      date_fin_contrat: form.date_fin_contrat || null,
      adresse_offre: form.adresse_offre,
      remuneration_offre: form.remuneration_offre ? parseInt(form.remuneration_offre) : null,
      pays: form.pays,
    };

    let res;

    if (offer?.id_offre) {
      // Modification
      res = await put(`offers/${offer.id_offre}`, offerData);
    } else {
      // Création
      res = await post("offers", JSON.stringify(offerData));
    }

    const resJson = await res.json();

    if (res.ok) {
      closePopup();
      alert("L'offre a été créée/modifiée avec succès");
      onOfferCreated();
    } else {
      console.log(resJson)
      setErrorMsg(resJson.message || "Erreur lors de la création/modification");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl bg-white rounded-xl space-y-4 p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {offer ? "Modifier l'offre" : "Créer une nouvelle offre"}
      </h2>

      {/* Intitulé de l'offre - Pleine largeur */}
      <InputDiv
        label="Intitulé de l'offre"
        name="intitule_offre"
        type="text"
        required
        value={form.intitule_offre}
        onChange={handleChange("intitule_offre")}
      />

      <div className="space-y-2">
        <Label htmlFor="type_contrat">Type de contrat *</Label>
        <Select
          value={form.type_contrat}
          required
          onValueChange={(value) =>
            handleSelectChange("type_contrat", value)
          }
        >
          <SelectTrigger id="type_contrat">
            <SelectValue placeholder="Sélectionnez un type de contrat" />
          </SelectTrigger>
          <SelectContent>
            {CONTRAT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Adresse et Pays - Sur une ligne */}
      <div className="grid grid-cols-2 gap-4">
        <InputDiv
          label="Adresse"
          name="adresse_offre"
          type="text"
          required
          value={form.adresse_offre}
          onChange={handleChange("adresse_offre")}
        />
        <InputDiv
          label="Pays"
          name="pays"
          type="text"
          required
          value={form.pays}
          onChange={handleChange("pays")}
        />
      </div>

      {/* Date de début et Date de fin - Sur une ligne */}
      <div className="grid grid-cols-2 gap-4">
        <InputDiv
          label="Date de début"
          name="date_debut_contrat"
          type="date"
          required
          value={toInputDate(form.date_debut_contrat)}
          onChange={handleChange("date_debut_contrat")}
        />
        <InputDiv
          label="Date de fin"
          name="date_fin_contrat"
          type="date"
          required
          value={toInputDate(form.date_fin_contrat)}
          onChange={handleChange("date_fin_contrat")}
        />
      </div>

      {/* Rémunération et Durée de validité - Sur une ligne */}
      <div className="grid grid-cols-2 gap-4">
        <InputDiv
          label="Rémunération (€ par mois)"
          name="remuneration_offre"
          type="number"
          value={form.remuneration_offre}
          onChange={handleChange("remuneration_offre")}
        />
        <InputDiv
          label="Validité (1-12 mois)"
          name="duree_validite"
          type="number"
          value={form.duree_validite}
          onChange={(e) => {
            let val = e.target.value;
            if (val) {
              const num = parseInt(val);
              if (num < 1) val = "1";
              if (num > 12) val = "12";
            }
            handleChange("duree_validite")({
              ...e,
              target: { ...e.target, value: val },
            } as any);
          }}
          min="1"
          max="12"
        />
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
          {offer ? "Modifier l'offre" : "Créer l'offre"}
        </Button>
      </div>
    </form>
  );
}
