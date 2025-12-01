import { Link, useNavigate } from "react-router-dom";

export function NavBar()
{
    const navigate = useNavigate();

    return (
        <nav>
            <Link to="/login">Login</Link> |{' '}
            <Link to="/register">Register</Link> |{' '}
        </nav>
    );
}