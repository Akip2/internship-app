"use client";
import { UserRole } from "@/enums/user-role";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface SessionContextType {
    token: string;
    role: UserRole;

    setToken: React.Dispatch<React.SetStateAction<string>>;
    setRole: React.Dispatch<React.SetStateAction<UserRole>>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.INTERNAUTE);

  return (
    <SessionContext.Provider value={{ token, role, setToken, setRole}}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  return context!;
};
