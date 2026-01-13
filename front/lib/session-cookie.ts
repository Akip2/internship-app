import Cookies from "js-cookie";
import { UserRole } from "@/enums/user-role";

export interface SessionData {
    token: string;
    login: string;
    role: UserRole;
}

const COOKIE_NAME = "session_optimatch";

export const setSessionCookie = (data: SessionData) => {
    Cookies.set(COOKIE_NAME, JSON.stringify(data), {
        expires: 7,
        sameSite: "strict",
    });
};

export const getSessionCookie = (): SessionData | null => {
    const raw = Cookies.get(COOKIE_NAME);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

export const clearSessionCookie = () => {
    Cookies.remove(COOKIE_NAME);
};
