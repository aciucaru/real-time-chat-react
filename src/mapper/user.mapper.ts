import type { UserResponseDTO } from "../models/dto/UserResponseDTO";
import type { User } from "../models/entity/User";

export function toUser(dto: UserResponseDTO): User
{
    return {
                userId: dto.userId,
                username: dto.username
            };
}