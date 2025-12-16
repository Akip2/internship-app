import InputDiv from "@/components/layout/input-div";
import { Button } from "@/components/ui/button"
import { useState } from "react";

export default function RegisterForm(props: { className?: string }) {
    const { className } = props;

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [siret, setSiret] = useState("");
    const [mail, setMail] = useState("");
    const [phone, setPhone] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [sector, setSector] = useState("");
    const [address, setAddress] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        console.log({ email: login, password })
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
            <InputDiv
                label="Login"
                type="text"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
            />

            <InputDiv
                label="Mot de passe"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <div className="div-group">
                <InputDiv
                    label="Raison sociale"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                />

                <InputDiv
                    label="SIRET"
                    type="text"
                    required
                    value={siret}
                    onChange={(e) => setSiret(e.target.value)}
                />
            </div>

            <div className="div-group">
                <InputDiv
                    label="Mail"
                    type="email"
                    required
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                />

                <InputDiv
                    label="Téléphone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>

            <div className="div-group">
                <InputDiv
                    label="Domaine d'activité"
                    type="text"
                    required
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                />

                <InputDiv
                    label="Adresse"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div>

            <Button type="submit" className="w-full">
                S'inscrire
            </Button>
        </form>
    )
}