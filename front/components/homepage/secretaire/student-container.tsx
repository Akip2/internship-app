import { StudentAccount } from "@/lib/types";

export default function StudentContainer(props: { className?: string, students: StudentAccount[] }) {
    const { className, students } = props;

    return (
        <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
            {/* Contenu de la gestion des étudiants à ajouter ici */}
        </div>
    );
}