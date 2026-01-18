import { useSession } from "@/providers/session-provider";

const host = process.env.NEXT_PUBLIC_API_HOST ?? "http://localhost";
const port = process.env.NEXT_PUBLIC_API_PORT ?? "4000";

export function useApi() {
    const { token } = useSession();

    const headers: any = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    const get = (endpoint: string) => {
        const headerCopy = { ...headers };
        return fetch(`${host}:${port}/${endpoint}`, {
            method: "GET",
            headers: headers
        });
    }

    const post = (endpoint: string, body: any, image: boolean = false) => {
        const headerCopy = { ...headers };
        if (image) {
            delete headerCopy["Content-Type"];
        }
        return fetch(`${host}:${port}/${endpoint}`, {
            method: "POST",
            headers: headerCopy,

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

export function getAttestation(attestationName: string) {
    return `${host}:${port}/uploads/attestations/${attestationName}`;
}

export function getCandidatureDoc(docName: string) {
    return `${host}:${port}/${docName}`;
}