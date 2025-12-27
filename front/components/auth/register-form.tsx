import InputDiv from "@/components/shared/input-div";
import { Button } from "@/components/ui/button"
import { post } from "@/lib/fetcher";
import { useSession } from "@/providers/session-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterForm(props: { className?: string }) {
    const { className } = props;

    const router = useRouter();
    const { setId, setRole } = useSession();

    const [errorMsg, setErrorMsg] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [siret, setSiret] = useState("");
    const [mail, setMail] = useState("");
    const [phone, setPhone] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [sector, setSector] = useState("");
    const [address, setAddress] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password.trim() !== passwordConfirmation.trim()) {
            setErrorMsg("Confirmation de mot de passe erronée");
            return;
        }
        
        setErrorMsg("");

        const res = await post("auth/register", JSON.stringify({
            login: login.trim().replace(" ", ""),
            password: password.replace(" ", ""),
            siret: siret.replace(" ", ""),
            mail: mail.trim(),
            phone: phone.replace(" ", ""),
            sector: sector.trim(),
            name: companyName.trim(),
            address: address.trim()
        }));

        const resJson = await res.json();

        if (res.ok) {
            setId(resJson.user_id);
            setRole(resJson.user_role);
            router.push("/");
        } else {
            setErrorMsg(resJson.message);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
            <InputDiv
                label="Login"
                type="text"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value.replace(" ", ""))}
            />

            <InputDiv
                label="Mot de passe"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(" ", ""))}
            />

            <InputDiv
                label="Confirmer le mot de passe"
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value.replace(" ", ""))}
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

            <div>
                <Button type="submit" className="w-full">
                    S'inscrire
                </Button>

                <p className="text-sm text-center text-red-400 font-bold h-0.5 mt-2">{errorMsg}</p>
            </div>
        </form>
    )
}