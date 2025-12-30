import StaffForm from "@/components/popup/staff-form";
import { Card } from "@/components/ui/card";
import { StaffType } from "@/enums/staff-type";
import { UserAccount } from "@/lib/types";
import { usePopup } from "@/providers/popup-provider";
import StaffCard from "./staff-card";
import { Button } from "@/components/ui/button";

export default function StaffContainer(props: { className?: string, type: StaffType, accounts: UserAccount[] }) {
    const { className, type, accounts } = props;

    const { openPopup } = usePopup();

    function displayForm() {
        openPopup(<StaffForm type={type} />)
    }

    return (
        <Card className={`p-6 space-y-4 ${className}`}>
            <h3 className="text-lg font-semibold">{type}(s)</h3>

            {accounts.length > 0 ? (
                accounts.map((acc, idx) => (
                    <StaffCard key={idx} user={acc} />
                ))
            ) : (
                <span className="text-gray-500">Aucun {type}</span>
            )}

            <Button className="bg-green-600 hover:bg-green-700" onClick={displayForm}>
                Ajouter un {type}
            </Button>
        </Card>
    )
}