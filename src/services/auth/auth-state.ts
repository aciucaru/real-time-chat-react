/* Axios interceptors run outside the React framework, so they cannot access the useAuthHook(). */

let _token: string | null = null;

export const authState = {
                            setToken: (token: string | null) => { _token = token; },
                            getToken: () => _token
                        };

