import { useEffect, useState, type ReactNode } from "react";
import { axiosPublicClient } from "./axios-clients";
import { AuthContext, type AuthContextType } from "./auth-context";
import type { UserResponseDto } from "../../models/dto/UserResponseDto";


/* This is a custom provider that:
** - stores access token in React state only (memory)
** - uses a refresh endpoint (server handles refresh token via HttpOnly cookie)
** - loads initial session by calling /auth/refresh on startup
** - provides login(), logout(), refreshAccessToken()
** This is not a React UI component. */

export function AuthProvider({children}: {children: ReactNode})
{
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<UserResponseDto | null>(null);

    // Refresh the acces token using HttOnly refresh cookie
    const refreshAccessToken = async () =>
    {
        try
        {
            const response = await axiosPublicClient.post("/auth/refresh", // url
                                                            null, // data
                                                            // required for HttpOnly cookie
                                                            { withCredentials: true, } // config
                                                        );

            setAccessToken(response.data.accessToken);
            setUser(response.data.user);
        }
        catch (error: any)
        { setAccessToken(null); }
    };

    // Try refreshing the token at app startup.
    // React useEffect cannot be async, so we create and call an async function inside it.
    useEffect( () =>
        {
            // Define an async function inside
            async function init()
            {
                // Attempt to refresh the access token using the server's HttpOnly refresh cookie.
                await refreshAccessToken();

                // Mark the authentication system as "finished initializing" so the rest of the app can render.
                setIsLoading(false);
            }

            // Call the async function
            init();

        }, [] // Empty dependency array means this runs once on startup
    );

    const authData: AuthContextType = {
        accessToken: accessToken,
        setAccessToken: setAccessToken,
        isAuthenticated: !!accessToken,
        isLoading: isLoading,
        refreshAccessToken: refreshAccessToken,
        user: user,
        setUser: setUser
    };

    // Pass the authentication data to the custom React context (AuthContext)
    return <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
}