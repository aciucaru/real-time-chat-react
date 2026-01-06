export interface AuthResponseDto
{
    userId: number; // Long type on the back-end
    username: string;
    token: string; // JWT or session token
}