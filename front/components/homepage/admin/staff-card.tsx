import { Button } from "@/components/ui/button";
import { UserAccount } from "@/lib/types";

export default function StaffCard(props: { user: UserAccount }) {
    const { user } = props;

    return (
        <div className="flex items-center justify-between rounded-xl border bg-white p-4 ">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                    {user.prenom[0]}
                    {user.nom[0]}
                </div>

                <div className="leading-tight">
                    <p className="font-semibold text-gray-900">
                        {user.prenom} {user.nom}
                    </p>

                    <p>{user.utilisateur.login}</p>
                </div>
            </div>

            <Button>
                Modifier
            </Button>
        </div>
    )
}