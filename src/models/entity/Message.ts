export interface Message
{
    id: string;
    senderId: number;
    receiverId: number;
    content: string;
    timestamp: Date; // here we use Date instead of 'string', for convenience
}