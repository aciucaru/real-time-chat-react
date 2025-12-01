export interface AuthResponseDTO
{
    userId: string; // UUID type on the back-end which will serialize to string in JSON format
    username: string;
    token: string; // JWT or session token
}