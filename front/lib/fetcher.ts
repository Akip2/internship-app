import { useSession } from "@/providers/session-provider";

const host = process.env.NEXT_PUBLIC_API_HOST ?? "http://localhost";
const port = process.env.NEXT_PUBLIC_API_PORT ?? "4000";
const headers = {
    'Content-Type': 'application/json',
    'Authorization': ""
};

export function useApi() {
    const { token } = useSession();

    headers.Authorization = token;

    const get = (endpoint: string) => {
        return fetch(`${host}:${port}/${endpoint}`, {
            method: "GET",
            headers: headers
        });
    }

    const post = (endpoint: string, body: any) => {
        return fetch(`${host}:${port}/${endpoint}`, {
            method: "POST",
            headers: headers,

            body: body
        });
    }

    return { get, post };
}