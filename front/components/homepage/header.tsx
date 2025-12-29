import { Button } from "../ui/button";

export default function Header(props: { className?: string }) {
    const { className } = props;

    return (
        <header className={`bg-white border-b ${className}`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border rounded flex items-center justify-center">
                        Logo
                    </div>
                    <span className="font-semibold">Admin</span>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary">Consulter les archives</Button>
                    <Button variant="destructive">
                        Se déconnecter
                    </Button>
                </div>
            </div>
        </header>
    )
}