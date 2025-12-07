import { useEffect, useState, type ReactNode } from "react";
import { axiosAuthClient, axiosPublicClient } from "./axios-clients";
import { AuthContext, type AuthContextType } from "./auth-context";
import type { UserResponseDto } from "../../models/dto/UserResponseDto";
import { authState } from "./auth-state";
import { login as loginService } from "../api/auth.service";
import type { UserLogintDto } from "../../models/dto/UserLoginDto";

const BASE_URL = "http://localhost:8080/auth";

/* This is a custom provider that:
** - stores access token in React state only (memory)
** - uses a refresh endpoint (server handles refresh token via HttpOnly cookie)
** - loads initial session by calling /auth/refresh on startup
** - provides login(), logout(), refreshAccessToken()
** This is not a React UI component. */
export function AuthProvider({children}: {children: ReactNode})
{
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isAuthenticated = !!accessToken && !!user;

    // Function that fetches the data (UserResponseDto: ID and username) of the current authenticated user
    // from the back-end, based on the current authenticated user's token.
    // We get the user data separately from the token, because this is a good practice.
    // Basically, after authentication, the back-end only returns a token, and the user data can be fetched
    // separately from the "/auth/me" endpoint.
    const fetchCurrentUserData = async (token: string) =>
    {
        try
        {
            // Set the token temporarily so that the axios auth client interceptor can atach it
            const previousToken = authState.getToken?.();
            authState.setToken?.(token);

            const response = await axiosAuthClient.get<UserResponseDto>(`${BASE_URL}/me`);
            setUser(response.data);

            // Optionally, restore previous token
            authState.setToken?.(previousToken ?? null);
        }
        catch (error: any)
        {
            console.error("Failed to fetch current user", error);
            setUser(null);
        }
    };

    // Login function
    const login = async (userLoginDto: UserLogintDto) =>
    {
        try
        {
            const response = await loginService(userLoginDto);

            setAccessToken(response.token);

            // Set the access token in the local storage as well, to survive a page close and a page reload
            localStorage.setItem("token", response.token);

            // Fetch user info
            await fetchCurrentUserData(response.token);
        }
        catch (error: any)
        { throw new Error(error.message || "Loginfailed"); }
    };

    // Logout function
    const logout = () =>
    {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem("token");
    };

    // Try refreshing the token at app startup.
    // React useEffect cannot be async, so we create and call an async function inside it.
    useEffect( () =>
        {
            // On initial load, we have no token, so we get it from localStorage, but only
            // during initial loading
            const token = localStorage.getItem("token");

            if (!token)
            {
                setIsLoading(false);
                return;
            }

            // Now we set the access token inside the React state
            setAccessToken(token);

            fetchCurrentUserData(token).catch( () => logout())
                                        .finally( () => setIsLoading(false) );

        },
        [] // Empty dependency array means this runs once on startup
    );

    const authData: AuthContextType = {
        accessToken: accessToken,
        setAccessToken: setAccessToken,

        user: user,
        setUser: setUser,

        login: login,
        logout: logout,

        isAuthenticated: !!accessToken && !!user,
        isLoading: isLoading,
    };

    // Pass the authentication data to the custom React context (AuthContext)
    return <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
}