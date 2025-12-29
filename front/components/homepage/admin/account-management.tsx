"use client";

import { useApi } from "@/lib/fetcher";
import { Account } from "@/lib/types";
import { useEffect, useState } from "react";
import TeacherContainer from "./teacher-container";
import SecretaryContainer from "./secretary-container";

export default function AccountManagement(props: { className?: string }) {
    const { className } = props;
    const { get } = useApi();

    const [secretaries, setSecretaries] = useState<Account[]>([]);
    const [teachers, setTeachers] = useState<Account[]>([]);

    useEffect(() => {
        async function fetchAccounts() {
            const secRes = await get("accounts/secretaire");
            const teachRes = await get("accounts/enseignant");

            if (secRes.ok) {
                setSecretaries(await secRes.json());
            }

            if (teachRes.ok) {
                setTeachers(await teachRes.json());
            }
        }

        fetchAccounts();
    }, []);

    return (
        <section className={`space-y-8 ${className ?? ""}`}>
            <h2 className="text-2xl font-semibold">Gestion des comptes</h2>

            <TeacherContainer teachers={teachers} />
            <SecretaryContainer secretaries={secretaries}/>
        </section>
    );
}
