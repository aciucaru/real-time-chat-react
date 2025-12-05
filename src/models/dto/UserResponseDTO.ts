// This is the user received from the back-end
export interface UserResponseDTO
{
    id: string; // UUID type on the back-end which will serialize to string in JSON format
    username: string;
}