import type { MessageResponseDto } from "../dto/MessageResponseDto";
import type { Message } from "../entity/Message";

export function toMessage(dto: MessageResponseDto): Message
{
    return {
        id: dto.id,
        senderId: dto.senderId,
        receiverId: dto.receiverId,
        content: dto.content,
        timestamp: new Date(dto.timestamp) // here we convert ISO-8601 timestamp 'string' to Date instead
    };
}