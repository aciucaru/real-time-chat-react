export interface MessageRequestDto
{
    // senderId: number; // Long type on the back-end
    receiverId: number; // Long type on the back-end
    content: string; // the actual message text
}