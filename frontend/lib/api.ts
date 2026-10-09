export async function apiFetch(endpoint: string, options?: RequestInit) {
    const res = await fetch(endpoint, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
        },
    });

    if (!res.ok) {
        // Session expired or invalid token — redirect to login
        if (res.status === 401) {
            if (typeof window !== "undefined") {
                window.location.href = "/auth/login";
            }
            throw new Error("Session expired");
        }

        if (res.status === 404) {
            throw new Error("404");
        }

        const errorText = await res.text();
        // Try to parse JSON error body and extract the "error" field
        // This prevents raw JSON like {"error":"..."} from showing in the UI
        let errorMsg = errorText || "API Error";
        try {
            const parsed = JSON.parse(errorText);
            if (parsed?.error) errorMsg = parsed.error;
        } catch { /* not JSON, use raw text */ }
        throw new Error(errorMsg);
    }

    return res.json();
}
