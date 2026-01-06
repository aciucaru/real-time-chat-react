/* This DTO is used both for receiveing a message from the back-end */
export interface MessageResponseDto
{
    id: string;
    senderId: number; // Long type on the back-end
    receiverId: number; // Long type on the back-end
    content: string; // the actual message text
    timestamp: string; // 'Instant' type on the backend, 'string' ISO-8601 format on the front-end
}