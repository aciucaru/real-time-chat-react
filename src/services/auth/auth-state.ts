/* Axios interceptors run outside the React framework, so they cannot access the useAuthHook().
** This is why we create a token object and make a getter and a setter for it.
** These getters and setters will be used inside the axios clients, in ./axios-client.ts. */
let _token: string | null = null;

export const authState = {
                            setToken: (token: string | null) => { _token = token; },
                            getToken: () => _token
                        };

