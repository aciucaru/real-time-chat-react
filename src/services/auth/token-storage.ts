export function setToken(token: string | null)
{
    if (token)
        sessionStorage.setItem("token", token);
    else 
        sessionStorage.removeItem("token");
}

export function getToken()
{
    return sessionStorage.getItem("token");
}