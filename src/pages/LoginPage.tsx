import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { LoginRequestDTO } from "../dto/LoginRequestDTO";
import type { AuthResponseDTO } from "../dto/AuthResponseDTO";

import { login } from "../services/auth.service";

export default function LoginPage()
{
    const navigate = useNavigate();

    // State for forms
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    // UI state
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Form submit
    const handleSubmit = async (event: React.FormEvent) =>
    {
        event.preventDefault;

        setError(null);
        setLoading(true);

        const payload: LoginRequestDTO = {username, password};

        try
        {
            const authResponse: AuthResponseDTO = await login(payload);

            // Save token for future requests
            localStorage.setItem("authToken", authResponse.token);

            // Save user info (optionally)
            localStorage.setItem("userId", authResponse.userId);
            localStorage.setItem("username", authResponse.username);

            // Redirect to chat page
            navigate("/chat");
        }
        catch (error: any)
        {
            // Set error state in order to refresh UI
            setError(error.message);
        }
        finally
        {
            // Set state in order to refesh UI
            setLoading(false);
        }
    };

    return (
        <div>
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            {error && (
            <div>{error}</div>
            )}

            <div className="mb-4">
            <label htmlFor="username">
                Username
            </label>
            <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            </div>

            <div className="mb-6">
            <label htmlFor="password">
                Password
            </label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>

            <button
            type="submit"
            className={`w-full p-2 rounded text-white font-bold ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={loading}
            >
            {loading ? "Logging in..." : "Login"}
            </button>
        </form>
        </div>
    );
}