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
        <div className="flex justify-center items-center h-screen bg-gray-100">
        <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded shadow-md w-full max-w-sm"
        >
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

            {error && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>
            )}

            <div className="mb-4">
            <label htmlFor="username" className="block mb-1 font-medium">
                Username
            </label>
            <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring"
                required
            />
            </div>

            <div className="mb-6">
            <label htmlFor="password" className="block mb-1 font-medium">
                Password
            </label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring"
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