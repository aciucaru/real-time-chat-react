import type { UserResponseDTO } from "../dto/UserResponseDTO";
import type { User } from "../entity/User";

export function toUser(dto: UserResponseDTO): User
{
    return {
                userId: dto.userId,
                username: dto.username
            };
}