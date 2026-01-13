import { useSession } from "@/providers/session-provider";

const host = process.env.NEXT_PUBLIC_API_HOST ?? "http://localhost";
const port = process.env.NEXT_PUBLIC_API_PORT ?? "4000";

export function useApi() {
    const { token } = useSession();

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

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

    const put = (endpoint: string, body: any) => {
        return fetch(`${host}:${port}/${endpoint}`, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(body),
        });
    };

    return { get, post, put };
}