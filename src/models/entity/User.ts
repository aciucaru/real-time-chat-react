export interface User
{
    userId: string; // UUID type on the back-end which will serialize to string in JSON format
    username: string;
}