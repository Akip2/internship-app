import StaffForm from "@/components/popup/staff-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StaffType } from "@/enums/staff-type";
import { Account } from "@/lib/types";
import { usePopup } from "@/providers/popup-provider";

export default function TeacherContainer(props: { className?: string, teachers: Account[] }) {
    const { className, teachers } = props;

    const { openPopup } = usePopup();

    function displayForm() {
        openPopup(<StaffForm type={StaffType.ENSEIGNANT}/>)
    }

    return (
        <Card className={`p-6 space-y-4 ${className}`}>
            <h3 className="text-lg font-semibold">
                Enseignant(s) Responsable(s)
            </h3>

            {teachers.length > 0 ? (
                teachers.map((teach, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                        <span>{teach.name}</span>
                        <Button>Modifier</Button>
                    </div>
                ))) :
                (
                    <span className="text-gray-500">Aucun enseignant</span>
                )}

            <Button className="bg-green-600 hover:bg-green-700" onClick={displayForm}>
                Ajouter un Enseignant Responsable
            </Button>
        </Card>
    )
}