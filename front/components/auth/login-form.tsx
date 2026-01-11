import { useSession } from "@/providers/session-provider";
import InputDiv from "@/components/shared/input-div";
import { Button } from "@/components/ui/button"
import { useState } from "react";
import {useRouter} from "next/navigation";
import { useApi } from "@/lib/fetcher";

export default function LoginForm(props: { className?: string }) {
    const { className } = props;

    const router = useRouter();
    const { setSession } = useSession();
    const { post } = useApi();

    const [loginForm, setLoginForm] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg("");

        const res = await post("auth/login", JSON.stringify({
            login: loginForm,
            password: password
        }));

        setPassword("");

        const resJson = await res.json();

        console.log(resJson);

        if (res.ok) {
            setSession({
                token: resJson.token,
                login: resJson.user.login,
                role: resJson.user.role
            });
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
                value={loginForm}
                onChange={(e) => setLoginForm(e.target.value)}
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