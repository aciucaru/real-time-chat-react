import { useEffect, useState } from "react";
import type { UserResponseDTO } from "../../models/dto/UserResponseDTO";


import { useAuthHook } from "../../services/auth/use-auth-hook";
import { getAllUsers } from "../../services/api/user.service";

export default function UserList()
{
    const { isAuthenticated } = useAuthHook();

    const [users, setUsers] = useState<UserResponseDTO[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect( () =>
    {
        if (!isAuthenticated)
        {
            setError("You must be logged in to view users");
            setIsLoading(true);

            return;
        }

        // React's useEffect() cannot be async, so we create an async fucntion inside it
        // and then call it.
        const loadUsers = async () =>
        {
            try
            {
                const list = await getAllUsers(); // get users from backend
                setUsers(list); // store users in state
            }
            catch (error: any)
            {
                // If backend returns error, show message
                setError(error?.response?.data?.message || "Failed to load users.");
            }
            finally
            {
                // Always stop loading spinner
                setIsLoading(false);
            }
        };

        // Call the async function
        loadUsers();
    }, [isAuthenticated]);

    if (isLoading)
        return <div>Loading users...</div>;

    if (error)
        return <div>{error}</div>;

    return (
    <div>
        <h3>Users</h3>

        <ul>
            {users.map((user) => (
                <li key={user.userId}>
                <div>{user.username}</div>
                </li>
            ))}
        </ul>
    </div>
    );
}