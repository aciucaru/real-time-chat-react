export interface Message
{
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: Date; // here we use Date instead of 'string', for convenience
}