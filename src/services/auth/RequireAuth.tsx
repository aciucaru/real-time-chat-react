import { Navigate, Outlet } from "react-router-dom";
import { useAuthHook } from "./use-auth-hook";


// This prevents rendering protected routes until user is authenticated
export function RequireAuth()
{
    const {isAuthenticated, isLoading} = useAuthHook();

    if (isLoading)
        return <div>Loading ...</div>;

    if (!isAuthenticated)
        return <Navigate to="/login" replace />;

    return <Outlet/>
}