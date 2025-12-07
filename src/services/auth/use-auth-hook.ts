import { useContext } from "react";
import { AuthContext, type AuthContextType } from "./auth-context";

/* This custom hook avoids using the token data (context) outside <AuthProvider>.
** This solution is sligthly better than directly calling:
      const { accessToken, setAccessToken } = useContext(AuthContext);
**    It's a better solution because the context is provided inside <AuthProvider>, and its available
** to any child inside <AuthProvider>. When used outside <AuthProvider>, it isn't available anymore, so it
** will be 'undefined', but we won't get any error mesage, we will just have a silent bug.
**    But this custom react hook throws an exception if the context is 'uneifend' and display a clear error
** message, that makes the bug easier to spot.
**    So instead of this (bug-prone and without error message):
**       const { accessToken, setAccessToken } = useContext(AuthContext); // no error message
** we use this:
**       const { accessToken, setAccessToken } = useAuth(); // displays error message */
export function useAuthHook(): AuthContextType
{
    const context = useContext(AuthContext);

    if (!context)
        // Here we show an explicit error message, to catch the bug, in the case
        // this is used outside <AuthProvider>
        throw new Error("useAuthHook must be used inside <AuthProvider>");
    
    return context;
}