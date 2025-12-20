import InputDiv from "@/components/layout/input-div";
import { Button } from "@/components/ui/button"
import { useState } from "react";

export default function LoginForm(props: { className?: string }) {
    const { className } = props;

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        console.log({ email: login, password })
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

            <Button type="submit" className="w-full">Se connecter</Button>
        </form>
    )
}