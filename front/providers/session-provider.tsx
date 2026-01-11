"use client";
import { UserRole } from "@/enums/user-role";
import { useRouter } from "next/navigation";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface SessionContextType {
  token: string;
  role: UserRole;
  login: string;

  setToken: React.Dispatch<React.SetStateAction<string>>;
  setRole: React.Dispatch<React.SetStateAction<UserRole>>;
  setLogin: React.Dispatch<React.SetStateAction<string>>
  logOut: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  
  const [token, setToken] = useState("");
  const [login, setLogin] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.INTERNAUTE);

  const logOut = () => {
    setRole(UserRole.INTERNAUTE);
    setToken("");
    router.push("/login");
  }

  return (
    <SessionContext.Provider value={{ token, login, role, setToken, setLogin, setRole, logOut }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  return context!;
};
