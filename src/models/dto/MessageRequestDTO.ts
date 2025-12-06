export interface MessageRequestDTO
{
    senderId: string; // UUID type on the back-end which will serialize to string in JSON format
    receiverId: string; // UUID type on the back-end
    content: string; // the actual message text
}