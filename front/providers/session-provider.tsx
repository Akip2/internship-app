"use client";
import { UserRole } from "@/enums/user-role";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface SessionContextType {
    id: number | null;
    role: UserRole;

    setId: React.Dispatch<React.SetStateAction<number | null>>;
    setRole: React.Dispatch<React.SetStateAction<UserRole>>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [id, setId] = useState<number | null>(null);
    const [role, setRole] = useState<UserRole>(UserRole.INTERNAUTE);

  return (
    <SessionContext.Provider value={{ id, role, setId, setRole}}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  return context!;
};
