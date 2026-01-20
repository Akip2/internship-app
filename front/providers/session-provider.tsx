"use client";

import { UserRole } from "@/enums/user-role";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {
  setSessionCookie,
  getSessionCookie,
  clearSessionCookie,
} from "@/lib/session-cookie";

interface SessionContextType {
  token: string;
  role: UserRole;
  login: string;
  hydrated: boolean;
  tempSecretaireMode: boolean;

  setSession: (data: { token: string; login: string; role: UserRole }) => void;
  logOut: () => void;
  setTempSecretaireMode: (enabled: boolean) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [login, setLogin] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.INTERNAUTE);
  const [hydrated, setHydrated] = useState(false);
  const [tempSecretaireMode, setTempSecretaireMode] = useState(false);

  useEffect(() => {
    const session = getSessionCookie();
    if (session) {
      setToken(session.token);
      setLogin(session.login);
      setRole(session.role);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (token) {
      setSessionCookie({ token, login, role });
    } else {
      clearSessionCookie();
    }
  }, [token, login, role, hydrated]);

  const setSession = (data: {
    token: string;
    login: string;
    role: UserRole;
  }) => {
    setToken(data.token);
    setLogin(data.login);
    setRole(data.role);
  };

  const logOut = () => {
    clearSessionCookie();
    setToken("");
    setLogin("");
    setRole(UserRole.INTERNAUTE);
    setTempSecretaireMode(false);
    router.push("/login");
  };

  return (
    <SessionContext.Provider
      value={{ token, login, role, hydrated, tempSecretaireMode, setSession, logOut, setTempSecretaireMode }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
};
