/**
 * HUMBLE API CLIENT
 * 
 * Rules:
 * - NO business logic.
 * - NO identity derivation.
 * - USES httpOnly cookies (credentials: 'include').
 * - SURFACES errors exactly as backend sends them.
 */

export class ApiClient {
    // AUTHORITATIVE BASE URL: Prefers environment variable, falls back to local for dev.
    private static baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1');

    static async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const method = options.method || 'GET';

        console.log(`[ApiClient] Request: ${method} ${url}`, {
            credentials: options.credentials || 'include',
            body: options.body ? JSON.parse(options.body as string) : undefined
        });

        try {
            const response = await fetch(url, {
                ...options,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            const text = await response.text();
            console.log(`[ApiClient] Response: ${response.status} ${url}`, text);

            if (!response.ok) {
                let errorMessage = text;
                try {
                    const errorJson = JSON.parse(text);
                    errorMessage = errorJson.message || text;
                } catch {
                    // Not JSON
                }
                throw new Error(errorMessage || `HTTP Error ${response.status}`);
            }

            try {
                return JSON.parse(text) as T;
            } catch {
                return text as unknown as T;
            }
        } catch (error: any) {
            console.error(`[ApiClient] CRITICAL FAILURE: ${method} ${url}`, {
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    static async get<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: 'GET' });
    }

    static async post<T>(path: string, body: any): Promise<T> {
        return this.request<T>(path, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    static async patch<T>(path: string, body: any): Promise<T> {
        return this.request<T>(path, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    static async delete<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: 'DELETE' });
    }
}
