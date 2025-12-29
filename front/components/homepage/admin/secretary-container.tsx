import StaffForm from "@/components/popup/staff-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StaffType } from "@/enums/staff-type";
import { UserAccount } from "@/lib/types";
import { usePopup } from "@/providers/popup-provider";
import StaffCard from "./staff-card";

export default function SecretaryContainer(props: { className?: string, secretaries: UserAccount[] }) {
    const { className, secretaries } = props;

    const { openPopup } = usePopup();

    function displayForm() {
        openPopup(<StaffForm type={StaffType.SECRETAIRE} />)
    }

    return (
        <Card className={`p-6 space-y-4 ${className}`}>
            <h3 className="text-lg font-semibold">Secrétaire(s)</h3>

            {secretaries.length > 0 ? (
                secretaries.map((sec, idx) => (
                    <StaffCard key={idx} user={sec}/>
                ))
            ) : (
                <span className="text-gray-500">Aucun secrétaire</span>
            )}

            <Button className="bg-green-600 hover:bg-green-700" onClick={displayForm}>
                Ajouter une Secrétaire
            </Button>
        </Card>
    )
}