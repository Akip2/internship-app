"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import InputDiv from "@/components/shared/input-div";
import { useApi } from "@/lib/fetcher";
import { usePopup } from "@/providers/popup-provider";
import AcademicLevelBox from "@/components/shared/academic-level-box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type StudentFormData = {
    firstName: string;
    lastName: string;
    mail: string;
    phone: string;
    birthDate: string;
    level: string;
    visibilite_infos?: boolean;
};

export default function StudentForm(props: { profile?: StudentFormData, onStudentCreated: () => void }) {
    const { profile, onStudentCreated } = props;

    const { post, put } = useApi();
    const { closePopup } = usePopup();

    const [form, setForm] = useState(profile ? profile : {
        firstName: "",
        lastName: "",
        mail: "",
        birthDate: "",
        level: "",
        phone: "",
        visibilite_infos: false
    });

    const handleChange = (field: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSelectChange = (field: string, value: string) => {
        setForm((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let res; 
        
        if (profile) { // modif
            res = await put("accounts/etudiant", form);
        } else { // creation
            res = await post("accounts/etudiant", JSON.stringify(form));
        }
        const resJson = await res.json();

        if (res.ok) {
            closePopup();
            alert("Le compte a été créé/modifié avec succès");
            onStudentCreated();
        } else {
            alert("Erreur lors de la création/modification: " + resJson.message);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white rounded-xl space-y-8"
        >
            <h2 className="text-3xl font-bold text-gray-900">
                {profile ? "Modifier le profil étudiant" : "Créer un compte étudiant"}
            </h2>

            <InputDiv
                label="Prénom"
                name="firstName"
                type="text"
                required
                value={form.firstName}
                onChange={handleChange("firstName")}
            />

            <InputDiv
                label="Nom"
                name="lastName"
                type="text"
                required
                value={form.lastName}
                onChange={handleChange("lastName")}
            />

            <InputDiv
                label="Email"
                name="mail"
                type="email"
                required
                value={form.mail}
                onChange={handleChange("mail")}
            />

            <InputDiv
                label="Numéro de téléphone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange("phone")}
            />

            <InputDiv
                label="Date de naissance"
                name="birthDate"
                type="date"
                required
                value={form.birthDate}
                onChange={handleChange("birthDate")}
            />

            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Niveau d’étude *
                </label>
                <AcademicLevelBox value={form.level} onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, level: value }))
                }/>
            </div>

            <Button type="submit" className="w-full">
                {profile ? "Modifier" : "Créer"}
            </Button>
        </form>
    );
}