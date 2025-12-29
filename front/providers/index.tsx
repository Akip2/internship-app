import { PopupProvider } from "./popup-provider";
import { SessionProvider } from "./session-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider><PopupProvider>{children}</PopupProvider></SessionProvider>
}