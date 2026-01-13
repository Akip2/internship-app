"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi } from "@/lib/fetcher";

export default function ProfileForm() {
    const { put, get } = useApi();
    const [profile, setProfile] = useState<any | null>(null);

    useEffect(() => {
        (async () => {
            const res = await get("accounts/me");
            const data = await res.json();
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

    const save = async () => {
        const res = await put("accounts/me", profile);
        if (res.ok) {
            alert("Profil mis à jour");
        } else {
            alert("Erreur lors de la mise à jour");
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 space-y-4">
            <h1 className="text-xl font-semibold">Mon profil</h1>

            <Input
                name="mail"
                value={profile.mail}
                disabled
            />

            <Input
                name="num_tel"
                value={profile.num_tel ?? ""}
                onChange={handleChange}
                placeholder="Téléphone"
            />

            {profile.role === "entreprise" ? (
                <>
                    <Input
                        name="raison_sociale"
                        value={profile.raison_sociale ?? ""}
                        onChange={handleChange}
                        placeholder="Raison sociale"
                    />

                    <Input
                        name="siret"
                        value={profile.siret ?? ""}
                        disabled
                    />
                </>
            )
                : (
                    <>
                        <Input
                            name="prenom"
                            value={profile.prenom ?? ""}
                            onChange={handleChange}
                            placeholder="Prénom"
                        />

                        <Input
                            name="nom"
                            value={profile.nom ?? ""}
                            onChange={handleChange}
                            placeholder="Nom"
                        />

                        {profile.role === "etudiant" && (
                            <Input
                                name="niveau_etu"
                                value={profile.niveau_etu ?? ""}
                                disabled
                            />
                        )}
                    </>
                )
            }

            <Button onClick={save}>
                Enregistrer
            </Button>
        </div>
    );
}
