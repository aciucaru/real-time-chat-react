export interface MessageResponseDTO
{
    id: string; // UUID type on the back-end which will serialize to string in JSON format
    senderId: string; // UUID type on the back-end which will serialize to string in JSON format
    content: string;
    timestamp: string; // 'Instant' type on the backend, 'string' ISO-8601 format on the front-end
}