"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import InputDiv from "../shared/input-div";
import { useApi } from "@/lib/fetcher";

export default function PasswordForm() {
    const { put } = useApi();

    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("Les mots de passe ne correspondent pas");
            return;
        }

        const res = await put("accounts/change-password", {
            newPassword: passwords.newPassword,
        });

        if (res.ok) {
            alert("Mot de passe mis à jour");
            setPasswords({ newPassword: "", confirmPassword: "" });
        } else {
            alert("Erreur lors de la mise à jour du mot de passe");
        }
    };

    return (
        <form className="max-w-xl mx-auto space-y-4 p-6" onSubmit={handleSubmit}>
            <h2 className="text-lg font-semibold">Changer le mot de passe</h2>

            <InputDiv
                label="Nouveau mot de passe"
                name="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={handleChange}
                required
            />

            <InputDiv
                label="Confirmer le nouveau mot de passe"
                name="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
            />

            <Button type="submit">
                Valider
            </Button>
        </form>
    );
}