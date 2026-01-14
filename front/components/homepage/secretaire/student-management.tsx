import { useApi } from "@/lib/fetcher";
import { StudentAccount } from "@/lib/types";
import { useState, useEffect } from "react";
import StudentContainer from "./student-container";
import { Button } from "@/components/ui/button";
import { usePopup } from "@/providers/popup-provider";
import StudentForm from "@/components/popup/forms/student-form";

export default function StudentManagement(props: { className?: string }) {
    const { className } = props;
    const { get, post } = useApi();
    const {openPopup} = usePopup();

    const [students, setStudents] = useState<StudentAccount[]>([]);

    const fetchStudents = async () => {
        const students = await get("accounts/etudiant");

        if (students.ok) {
            const res = await students.json()
            setStudents(res);
        }
    }

    useEffect(() => {
        fetchStudents();
    }, []);

    return (
        <section className={`space-y-8 ${className ?? ""}`}>
            <div className="div-group">
                <h2 className="text-2xl font-semibold">Liste des étudiants de l'année en cours</h2>
                <Button onClick={() => {openPopup(<StudentForm/>)}}>+ Créer un compte étudiant</Button>
            </div>

            {students.length === 0 ? (
                <p>Aucun étudiant enregistré.</p>
            ) : <StudentContainer students={students} />}
        </section>
    );
}