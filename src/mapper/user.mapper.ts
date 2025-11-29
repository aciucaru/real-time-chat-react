import type { UserResponseDTO } from "../dto/UserResponseDTO";
import type { User } from "../models/User";

export function toUser(dto: UserResponseDTO): User
{
    return {
                userId: dto.userId,
                username: dto.username,
                displayName: dto.displayName
            };
}