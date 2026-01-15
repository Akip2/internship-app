import { StudentAccount } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatDateFR, toInputDate } from "@/lib/utils";
import { usePopup } from "@/providers/popup-provider";
import StudentForm from "@/components/popup/forms/student-form";

function studentToFormProfile(student: StudentAccount) {
  return {
    firstName: student.prenom ?? "",
    lastName: student.nom ?? "",
    mail: student.mail ?? "",
    birthDate: student.date_naissance_etu ?? "",
    level: student.niveau_etu ?? "",
      phone: student.num_tel ?? "",
    id_utilisateur: student.id_utilisateur
  };
}

export default function StudentContainer(props: {
    className?: string;
    students: StudentAccount[];
    onStudentCreated: () => void;
}) {
    const { className, students, onStudentCreated } = props;
    const { openPopup } = usePopup();
    
    console.log(students)

    return (
        <div className={`p-6 bg-white rounded-lg shadow ${className ?? ""}`}>
            <h2 className="text-xl font-semibold mb-4">Étudiants</h2>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b text-left text-sm text-gray-600">
                            <th className="py-3 px-4">Nom</th>
                            <th className="py-3 px-4">Prénom</th>
                            <th className="py-3 px-4">Niveau</th>
                            <th className="py-3 px-4">Date de naissance</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {students.map((student) => (
                            <tr
                                key={student.id_utilisateur}
                                className="border-b last:border-b-0 hover:bg-gray-50"
                            >
                                <td className="py-3 px-4 font-medium">
                                    {student.nom}
                                </td>
                                <td className="py-3 px-4">
                                    {student.prenom}
                                </td>
                                <td className="py-3 px-4">
                                    {student.niveau_etu}
                                </td>
                                <td className="py-3 px-4">
                                    {formatDateFR(student.date_naissance_etu)}
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <Button variant="secondary" onClick={() => openPopup(<StudentForm profile={studentToFormProfile(student)} onStudentCreated={onStudentCreated} />)}>
                                        Modifier les informations
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
