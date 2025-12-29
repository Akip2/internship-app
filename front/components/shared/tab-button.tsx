export default function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative py-4 text-base font-medium transition ${
        active
          ? "text-blue-600"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600" />
      )}
    </button>
  );
}