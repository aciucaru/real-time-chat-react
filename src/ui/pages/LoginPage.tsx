import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { UserLogintDto } from "../../models/dto/UserLoginDto";
import { login } from "../../services/api/auth.service";
import { useAuthHook } from "../../services/auth/use-auth-hook";
import { setToken } from "../../services/auth/token-storage";
import type { UserResponseDto } from "../../models/dto/UserResponseDto";

export default function LoginPage()
{
    const navigate = useNavigate();
    const { setAccessToken, setUser } = useAuthHook();

    // State for forms
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    // UI state
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form submit
    const handleSubmit = async (event: React.FormEvent) =>
    {
        event.preventDefault();

        setIsSubmitting(true);
        setError(null);

        try
        {
            const payload: UserLogintDto = {username, password};

            // Send credentials to backend
            const authResponse = await login(payload);

            // Store the received access token in React Context and in tokenStore
            setAccessToken(authResponse.token);
            setToken(authResponse.token);

            const userDto: UserResponseDto = {
              id: authResponse.userId,
              username: authResponse.username
            };
            setUser(userDto);
            
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
          type="text"
          placeholder="Username"
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