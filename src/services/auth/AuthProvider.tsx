import { useEffect, useState, type ReactNode } from "react";
import { axiosAuthClient, axiosPublicClient } from "./axios-clients";
import { AuthContext, type AuthContextType } from "./auth-context";
import type { UserResponseDto } from "../../models/dto/UserResponseDto";
import { login as loginService } from "../api/auth.service";
import type { UserLogintDto } from "../../models/dto/UserLoginDto";
import { setToken } from "./token-storage";

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

    // const isAuthenticated = !!accessToken && !!user;
    const isAuthenticated = !!accessToken;

    // Function that fetches the data (UserResponseDto: ID and username) of the current authenticated user
    // from the back-end, based on the current authenticated user's token.
    // We get the user data separately from the token, because this is a good practice.
    // Basically, after authentication, the back-end only returns a token, and the user data can be fetched
    // separately from the "/auth/me" endpoint.
    const fetchCurrentUserData = async (token: string) =>
    {
        try
        {
            setToken(token);

            const response = await axiosAuthClient.get<UserResponseDto>(`${BASE_URL}/me`);
            setUser(response.data);
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
            setToken(response.token);

            // Set the access token in the local storage as well, to survive a page close and a page reload
            localStorage.setItem("token", response.token);
        }
        catch (error: any)
        { throw new Error(error.message || "Login failed"); }
    };

    // Logout function
    const logout = () =>
    {
        // Clear auth state
        setAccessToken(null);
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
    };

    // Effect #1: Load token from storage on initial page load
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
            setToken(token);

            // User will be loaded by Effect #2
            setIsLoading(false);
        },
        [] // this effect runs only once
    );

    // Effect #2: whenever token changes, fetch user
    useEffect( () =>
        {
            if (!accessToken)
            {
                setUser(null);
                return;
            }

            fetchCurrentUserData(accessToken);
        },
        [accessToken] // run this effect every time accesssToken changes
    );

    const authData: AuthContextType = {
        accessToken: accessToken,
        setAccessToken: setAccessToken,

        user: user,
        setUser: setUser,

        login: login,
        logout: logout,

        isAuthenticated: isAuthenticated,
        isLoading: isLoading
    };

    // Pass the authentication data to the custom React context (AuthContext)
    return <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
}