import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { LoginRequestDTO } from "../dto/LoginRequestDTO";
import type { AuthResponseDTO } from "../dto/AuthResponseDTO";

import { login } from "../services/auth/auth.service";
import { useAuthHook } from "../services/auth/use-auth-hook";
import { axiosPublicClient } from "../services/auth/axios-clients";

export default function LoginPage()
{
    const navigate = useNavigate();
    const { setAccessToken } = useAuthHook();

    // State for forms
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    // UI state
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form submit
    const handleSubmit = async (event: React.FormEvent) =>
    {
        event.preventDefault;

        setIsSubmitting(true);
        setError(null);

        try
        {
            const payload: LoginRequestDTO = {username, password};

            // Send credentials to backend
            const authResponse = await login(payload);

            // Store the received access token in React Context and in tokenStore
            setAccessToken(authResponse.token);
            
            // Redirect to chat page
            navigate("/chat");
        }
        catch (error: any)
        {
            // Set error state in order to refresh UI
            setError(error?.response?.data?.message || "Login failed");
        }
        finally
        {
            // Set state in order to refesh UI
            setIsSubmitting(false);
        }
    };

    return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div>{error}</div>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}