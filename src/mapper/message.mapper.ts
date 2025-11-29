import type { MessageResponseDTO } from "../dto/MessageResponseDTO";
import type { Message } from "../models/Message";

export function toMessage(dto: MessageResponseDTO): Message
{
    return {
        id: dto.id,
        senderId: dto.senderId,
        receiverId: dto.receiverId,
        content: dto.content,
        timestamp: new Date(dto.timestamp) // here we convert ISO-8601 timestamp 'string' to Date instead
    };
}