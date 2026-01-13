import { useSession } from "@/providers/session-provider";
import { Button } from "../ui/button";
import Image from "next/image";

export default function Header(props: { className?: string }) {
    const { className } = props;

    const { logOut, role, login } = useSession();

    return (
        <header className={`bg-white border-b ${className}`}>
            <div className="flex items-center justify-between p-4 mx-10">
                <div className="flex items-center gap-10">
                    <Image src="/idmc.png" alt="logo" width={200} height={200}/>
                    <span className="font-semibold">{`${login} `}<span className="font-normal">{`(${role})`}</span></span>
                </div>

                <div className="flex gap-3">
                    <Button variant="destructive" onClick={logOut}>
                        Se déconnecter
                    </Button>
                </div>
            </div>
        </header>
    )
}