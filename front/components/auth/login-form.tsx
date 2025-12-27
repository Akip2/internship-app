import { useSession } from "@/providers/session-provider";
import InputDiv from "@/components/shared/input-div";
import { Button } from "@/components/ui/button"
import { post } from "@/lib/fetcher";
import { useState } from "react";
import {useRouter} from "next/navigation";

export default function LoginForm(props: { className?: string }) {
    const { className } = props;

    const router = useRouter();
    const { setId, setRole } = useSession();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg("");

        const res = await post("auth/login", JSON.stringify({
            login: login,
            password: password
        }));

        setLogin("");
        setPassword("");

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
        <form onSubmit={handleSubmit} className={className}>
            <InputDiv
                label="Login"
                type="text"
                required={true}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
            />

            <InputDiv
                label="Mot de passe"
                type="password"
                required={true}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <div>
                <Button type="submit" className="w-full">Se connecter</Button>

                <p className="text-sm text-center text-red-400 font-bold h-0.5 mt-2">{errorMsg}</p>
            </div>
        </form>
    )
}