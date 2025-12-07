import { createContext } from "react";
import type { UserResponseDto } from "../../models/dto/UserResponseDto";
import type { UserLogintDto } from "../../models/dto/UserLoginDto";

// The data type of the React context
export interface AuthContextType
{
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;

    user: UserResponseDto | null;
    setUser: (user: UserResponseDto | null) => void;

    login: (userLogin: UserLogintDto) => Promise<void>;
    logout: () => void;

    isAuthenticated: boolean;
    isLoading: boolean;
}

/*    This is a React Context, which is basically a prop which is automatically sent to all the
** children of this component, whithout requiring "prop drilling".
**    This React Context also triggers the React components to automatically update if the React
** Context changes.
**    This React Context is used similar to a React component, and any of it's child components
** will receive it's data automatically, without "prop-drilling".
**    Every child inside the provider gets access to the authentication data. */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);