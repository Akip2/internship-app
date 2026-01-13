import { StaffType } from "@/enums/staff-type";
import { useState } from "react";
import InputDiv from "../shared/input-div";
import { Button } from "../ui/button";
import { useApi } from "@/lib/fetcher";
import { usePopup } from "@/providers/popup-provider";

export default function StaffForm(props: { className?: string, type: StaffType, onAccountAdded: () => Promise<void> }) {
    const { className, type, onAccountAdded } = props;

    const { post } = useApi();
    const { closePopup} = usePopup();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [mail, setMail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password.trim() !== passwordConfirmation.trim()) {
            setErrorMsg("Confirmation de mot de passe erronée");
            return;
        }

        setErrorMsg("");

        try {
            const res = await post(`accounts/${type}`, JSON.stringify({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                password: password.replace(" ", ""),
                mail: mail.trim(),
                phone: phone.replace(" ", ""),
            }));
            
            if (res.ok) {
                closePopup();
                alert("Le compte a été créé avec succès");

                onAccountAdded();
            } else {
                alert("Erreur lors de la création");
            }
        } catch {
            alert("Erreur réseau");
        }
    }

    return (
        <div className={`w-full max-w-md bg-white rounded-xl space-y-8 ${className}`}>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Création de compte {type === StaffType.ENSEIGNANT ? "Enseignant" : "Secretaire"}
                </h1>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
                <InputDiv
                    label="Prénom"
                    type="text"
                    required={true}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />

                <InputDiv
                    label="Nom"
                    type="text"
                    required={true}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />

                <InputDiv
                    label="Adresse mail de contact"
                    type="email"
                    required={true}
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                />

                <InputDiv
                    label="Téléphone"
                    type="tel"
                    required={true}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <InputDiv
                    label="Mot de passe"
                    type="password"
                    required={true}
                    value={password}
                    onChange={(e) => setPassword(e.target.value.replace(" ", ""))}
                />

                <InputDiv
                    label="Confirmer le mot de passe"
                    type="password"
                    required={true}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value.replace(" ", ""))}
                />

                <div>
                    <Button type="submit" className="w-full">Créer le compte</Button>

                    <p className="text-sm text-center text-red-400 font-bold h-0.5 mt-2">{errorMsg}</p>
                </div>
            </form>
        </div>
    )
}