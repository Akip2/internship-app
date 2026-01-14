"use client";

import { useSession } from "@/providers/session-provider";
import { Button } from "../ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePopup } from "@/providers/popup-provider";
import NotificationContainer from "../popup/notification-container";
import ProfileForm from "../popup/forms/profile-info";

export default function Header(props: { className?: string }) {
    const { className } = props;
    const router = useRouter();

    const { logOut, role, login } = useSession();
    const { openPopup} = usePopup();

    return (
        <header className={`bg-white border-b ${className}`}>
            <div className="flex items-center justify-between p-4 mx-10">
                <div className="flex items-center gap-10">
                    <Image src="/idmc.png" alt="logo" width={200} height={200} />
                    <span className="font-semibold">
                        {login} <span className="font-normal">({role})</span>
                    </span>
                </div>

                <div className="flex gap-3">
                    <Button onClick={() => openPopup(<ProfileForm/>)}>
                        Mon profil
                    </Button>

                    <Button onClick={() => openPopup(<NotificationContainer/>)}>
                        Notifications
                    </Button>

                    <Button variant="destructive" onClick={logOut}>
                        Se déconnecter
                    </Button>
                </div>
            </div>
        </header>
    );
}