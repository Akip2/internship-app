"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/fetcher";
import InputDiv from "../../shared/input-div";
import { useSession } from "@/providers/session-provider";
import { usePopup } from "@/providers/popup-provider";
import PasswordForm from "./password-form";
import { toInputDate } from "@/lib/utils";

export default function ProfileForm() {
    const { put, get } = useApi();
    const { role } = useSession();
    const { openPopup } = usePopup();
    const [profile, setProfile] = useState<any | null>(null);

    useEffect(() => {
        (async () => {
            const res = await get("accounts/me");
            const data = await res.json();
            console.log(data);
            setProfile(data);
        })();
    }, []);

    if (!profile) {
        return <p className="p-6">Chargement…</p>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
console.log(profile);
        const res = await put("accounts/me", profile);
        alert(res.ok ? "Profil mis à jour" : "Erreur lors de la mise à jour");
    };

    const passwordChangePopup = (e: React.FormEvent) => {
        e.preventDefault();

        openPopup(<PasswordForm />);
    }

    return (
        <form className="min-w-lg space-y-8" onSubmit={save}>
            <h1 className="text-3xl font-bold text-gray-900">Profil</h1>

            <InputDiv
                label="Email"
                name="mail"
                type="email"
                value={profile.mail ?? ""}
                onChange={handleChange}
                required
            />

            <div className="div-group">
                <InputDiv
                    label="Mot de passe"
                    name="password"
                    type="password"
                    value={"password"}
                    disabled
                />

                <Button className="self-end" variant={"destructive"} onClick={passwordChangePopup}>Modifier</Button>
            </div>

            <InputDiv
                label="Téléphone"
                name="num_tel"
                type="tel"
                value={profile.num_tel ?? ""}
                onChange={handleChange}
                required
            />

            {role === "entreprise" && (
                <>
                    <InputDiv
                        label="Raison sociale"
                        name="raison_sociale"
                        type="text"
                        value={profile.raison_sociale ?? ""}
                        onChange={handleChange}
                        required
                    />

                    <InputDiv
                        label="Domaine d'activité"
                        name="domaine_entreprise"
                        type="text"
                        value={profile.domaine_entreprise ?? ""}
                        onChange={handleChange}
                        required
                    />

                    <InputDiv
                        label="Adresse"
                        name="adresse_entreprise"
                        type="text"
                        value={profile.adresse_entreprise ?? ""}
                        onChange={handleChange}
                        required
                    />

                    <InputDiv
                        label="SIRET"
                        name="siret"
                        type="text"
                        value={profile.siret_entreprise ?? ""}
                        disabled
                    />
                </>
            )}

            {role !== "admin" && role !== "entreprise" && (
                <>
                    <InputDiv
                        label="Prénom"
                        name="prenom"
                        type="text"
                        value={profile.prenom ?? ""}
                        onChange={handleChange}
                        required
                    />

                    <InputDiv
                        label="Nom"
                        name="nom"
                        type="text"
                        value={profile.nom ?? ""}
                        onChange={handleChange}
                        required
                    />

                    {role === "etudiant" && (
                        <>
                            <InputDiv
                                label="Date de naissance"
                                name="date_naissance_etu"
                                type="date"
                                required
                                value={toInputDate(profile.date_naissance_etu)}
                                onChange={handleChange}
                            />

                            <InputDiv
                                label="Niveau"
                                name="niveau_etu"
                                type="text"
                                required
                                value={toInputDate(profile.niveau_etu)}
                                disabled
                            />
                        </>
                    )}
                </>
            )}

            <Button type="submit">
                Enregistrer
            </Button>
        </form>
    );
}
