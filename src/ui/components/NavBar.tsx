import { Link, useNavigate } from "react-router-dom";

// This navigation bar is for testing purposes only. It will be removed in the final version.
export function NavBar()
{
    const navigate = useNavigate();

    return (
        <nav>
            <Link to="/login">Login</Link> |{' '}
            <Link to="/register">Register</Link> |{' '}
            <Link to="/chat">Chat</Link> {' '}
        </nav>
    );
}