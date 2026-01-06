import { useEffect, useState } from "react";
import type { UserResponseDto } from "../../models/dto/UserResponseDto";

import { useAuthHook } from "../../services/auth/use-auth-hook";
import { getAllUsers } from "../../services/api/user.service";

import styles from "./UserList.module.css";

interface UserListProps
{
    // Callback when a user is selected from the list
    onUserSelected: (user: UserResponseDto) => void;
}

// This component displays the list of all available users, so that the current user
// can choose a user to chat it.
export default function UserList(props: UserListProps)
{
    const { isAuthenticated, user } = useAuthHook();

    const [users, setUsers] = useState<UserResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect( () =>
        {
            // Temporarily disabled
            // if (!isAuthenticated)
            // {
            //     setError("You must be logged in to view users");
            //     setIsLoading(true);

            //     return;
            // }

            // React's useEffect() cannot be async, so we create an async fucntion inside it
            // and then call it.
            const loadUsers = async () =>
            {
                try
                {
                    const userList = await getAllUsers(); // get users from backend
                    setUsers(userList); // store users in state
                }
                catch (error: any)
                {
                    // If backend returns error, show message
                    setError(error?.response?.data?.message || "Failed to load users.");
                }
                finally
                {
                    // Always stop loading graphics
                    setIsLoading(false);
                }
            };

            // Call the async function
            loadUsers();
        },
        [isAuthenticated] // run this effect every time 'isAuthenticated' changes
    );

    if (isLoading)
        return <div>Loading users...</div>;

    if (error)
        return <div>{error}</div>;

    if (users.length === 0)
        return <div>No users found</div>;

    return (
    <div className={`${styles.mainContainer}`}>
        {users.map((usr) =>
            {
                const isCurrentUser = String(usr.id) === String(user?.id);

                return (
                <div
                    key={usr.id}
                    className={`${styles.userContainer} ${isCurrentUser ? styles.currentUser : styles.otherUser}`}
                    onClick={() => props.onUserSelected(usr)}
                >
                    <div>{usr.username}</div>
                </div>
            );}
        )}
    </div>
    );
}