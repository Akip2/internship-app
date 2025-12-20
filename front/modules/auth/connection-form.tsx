'use client'

import Link from "next/link";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";

export default function ConnectionForm(props: { isLogin: boolean }) {
    const { isLogin } = props;

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isLogin ? "Se connecter" : "S'inscrire"}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Restez informé de votre monde professionnel
                    </p>
                </div>

                {isLogin
                    ? <LoginForm className="space-y-8" />
                    : <RegisterForm className="space-y-8" />
                }

                <hr />

                <div className="text-center text-sm">
                    <span>
                        {isLogin ? "Vous êtes une entreprise ?" : "Vousn avez déjà un compte ?"}

                        <Link
                            href={isLogin ? "/register" : "/login"}
                            className="ml-1 font-semibold text-blue-600 hover:underline"
                        >
                            {isLogin ? "Inscrivez-vous" : "Connectez-vous"}
                        </Link>
                    </span>
                </div>
            </div>
        </div>

    )
}