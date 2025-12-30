export default function LoadingPopup() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      <p className="font-medium">Création du compte…</p>
    </div>
  );
}