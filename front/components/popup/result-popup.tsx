export default function ResultPopup(props: { success: boolean, message: string }) {
    const { success, message } = props;
    return (
        <div className="space-y-4 text-center">
            <h2
                className={`text-lg font-semibold ${success ? "text-green-600" : "text-red-600"
                    }`}
            >
                {success ? "Succès" : "Erreur"}
            </h2>

            <p>{message}</p>
        </div>
    );
}
