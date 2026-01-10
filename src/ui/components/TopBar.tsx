import { useNavigate } from "react-router-dom";
import { useAuthHook } from "../../services/auth/use-auth-hook.ts";
import { useChat } from "../../services/web-socket/use-chat";

export function TopBar()
{
    const navigate = useNavigate();

    const { user, isAuthenticated, logout } = useAuthHook();
    const { close } = useChat();

    if (!isAuthenticated)
        return null;

    const handleLogout = () =>
    {
        // close WebSocket immediately
        close();

        // clear auth + token
        logout();

        // Redirect to login page
        navigate("/login");
    };

    return (
        <header
            style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 16px",
            background: "#222",
            color: "#fff",
            }}
        >
            <span>Logged in as: <strong>{user?.username}</strong></span>

            <button
                onClick={handleLogout}
                style={{
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                }}
            >
            Logout
            </button>
        </header>
    );
}