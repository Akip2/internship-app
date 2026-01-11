"use client";

import { useApi } from "@/lib/fetcher";
import { UserAccount } from "@/lib/types";
import { useEffect, useState } from "react";
import StaffContainer from "./staff-container";
import { StaffType } from "@/enums/staff-type";

export default function AccountManagement(props: { className?: string }) {
    const { className } = props;
    const { get } = useApi();

    const [secretaries, setSecretaries] = useState<UserAccount[]>([]);
    const [teachers, setTeachers] = useState<UserAccount[]>([]);

    async function fetchAccounts() {
        const secRes = await get("accounts/secretaire");
        const teachRes = await get("accounts/enseignant");

        if (secRes.ok) {
            const res = await secRes.json()
            setSecretaries(res);
        }

        if (teachRes.ok) {
            const res = await teachRes.json()
            setTeachers(res);
        }
    }

    useEffect(() => {
        fetchAccounts();
    }, []);

    return (
        <section className={`space-y-8 ${className ?? ""}`}>
            <h2 className="text-2xl font-semibold">Gestion des comptes</h2>

            <StaffContainer accounts={teachers} type={StaffType.ENSEIGNANT} onAccountAdded={fetchAccounts}/>
            <StaffContainer accounts={secretaries} type={StaffType.SECRETAIRE} onAccountAdded={fetchAccounts}/>
        </section>
    );
}
