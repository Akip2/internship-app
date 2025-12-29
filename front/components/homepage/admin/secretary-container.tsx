import StaffForm from "@/components/popup/staff-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StaffType } from "@/enums/staff-type";
import { Account } from "@/lib/types";
import { usePopup } from "@/providers/popup-provider";

export default function SecretaryContainer(props: { className?: string, secretaries: Account[] }) {
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
                    <div
                        key={idx}
                        className="flex items-center justify-between"
                    >
                        <span>{sec.name}</span>
                        <div className="flex gap-2">
                            <Button>Modifier</Button>
                            <Button className="bg-red-600 hover:bg-red-700">
                                Archiver
                            </Button>
                        </div>
                    </div>
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