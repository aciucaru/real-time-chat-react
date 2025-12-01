import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SignUpRequestDTO } from "../../models/dto/SignUpRequestDTO";
import { signUp } from "../../services/api/auth.service";

export default function RegisterPage()
{
    const navigate = useNavigate();

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async (evt: React.FormEvent) =>
    {
        evt.preventDefault();
        
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        const payload: SignUpRequestDTO = {
            username: username,
            password: password
        };

        try
        {
            await signUp(payload);

            setSuccess("Accoutn successfully created!");
            setTimeout( () => { navigate("/login"); }, 1000 );
        }
        catch (error: any)
        { setError(error?.response?.data?.message || "Registration failed."); }
        finally
        { setIsSubmitting(false); }
    };

    return (
        <div>
        <h2>Create Account</h2>

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
            {success && <div>{success}</div>}

            <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
            </button>
        </form>
        </div>
    );
}